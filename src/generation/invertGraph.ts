import { deepEqual } from 'fast-equals';

import { CollectorNode, Graph, Node, TokenNode } from '../graph/index.js';
import { Token } from '../tokenization/index.js';

import { joinTokens } from './join.js';

/**
 * Text that a graph matches, together with the value it resolves to.
 */
export interface InvertedText<V> {
	/**
	 * The text, as the graph has it written.
	 */
	readonly text: string;

	/**
	 * The value the text resolves to.
	 */
	readonly value: V;
}

/**
 * The longest path followed while reading a graph.
 */
const MAX_LENGTH = 20;

/**
 * Two times far apart, used to find the texts of a graph that mean something
 * different depending on when they are read, such as `this month`.
 */
const FIRST_TIME = new Date(2021, 5, 15, 12, 0, 0);
const SECOND_TIME = new Date(2023, 10, 3, 12, 0, 0);

const cache = new WeakMap<Graph<any>, InvertedText<any>[]>();

/**
 * Read the texts a graph matches together with the values they resolve to.
 * Only texts made up of words are read, so a graph that matches numbers via
 * a regular expression or another graph contributes nothing.
 *
 * Texts that resolve to a different value depending on when they are read,
 * such as `this month`, are left out. Everything this returns means the same
 * thing whenever it is read, which is what a text that gets stored in a link
 * has to do.
 *
 * The result is cached per graph and is returned in the order the graph was
 * written, so the first way of saying something comes first.
 *
 * @param graph -
 *   the graph to read
 * @returns
 *   the texts of the graph and the values they resolve to
 */
export function invertGraph<V>(graph: Graph<V>): InvertedText<V>[] {
	const cached = cache.get(graph);
	if(cached) return cached;

	const paths: { tokens: Token[]; collector: CollectorNode<V> }[] = [];
	const visited: Node[] = [];

	const walk = (nodes: readonly Node[], tokens: readonly Token[]) => {
		if(visited.length >= MAX_LENGTH) return;

		for(const node of nodes) {
			if(visited.includes(node)) continue;

			visited.push(node);
			try {
				if(node instanceof TokenNode) {
					walk(node.outgoing, [ ...tokens, node.token ]);
				} else if(node instanceof CollectorNode && tokens.length > 0) {
					paths.push({ tokens: [ ...tokens ], collector: node });
				}
			} finally {
				visited.pop();
			}
		}
	};

	walk(graph.nodes, []);

	const result: InvertedText<V>[] = [];
	for(const path of paths) {
		const first = resolve(path.collector, FIRST_TIME);
		if(first === null) continue;

		// Texts that mean something else at another time are of no use here
		const second = resolve(path.collector, SECOND_TIME);
		if(second === null || ! deepEqual(first, second)) continue;

		result.push({
			text: joinTokens(path.tokens),
			value: first
		});
	}

	cache.set(graph, result);
	return result;
}

/**
 * Get the texts of a graph that resolve to the given value.
 *
 * @param graph -
 *   the graph to read
 * @param matches -
 *   check that tells if a value is the one being looked for
 * @returns
 *   the texts that resolve to the value
 */
export function textsFor<V>(graph: Graph<V>, matches: (value: V) => boolean): string[] {
	const result: string[] = [];
	for(const entry of invertGraph(graph)) {
		if(matches(entry.value)) {
			result.push(entry.text);
		}
	}

	return result;
}

/**
 * Resolve what a collector node collects when nothing before it has matched.
 *
 * @param collector -
 *   the node to resolve
 * @param now -
 *   the time to read the value as
 * @returns
 *   the value, or `null` if the node needs more than this to resolve one
 */
function resolve<V>(collector: CollectorNode<V>, now: Date): V | null {
	try {
		return collector.resolve([], { now: now });
	} catch {
		// The node needs data this path does not give it
		return null;
	}
}
