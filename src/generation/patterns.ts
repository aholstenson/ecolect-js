import { CollectorNode, Graph, Node, TokenNode } from '../graph/index.js';
import { Token } from '../tokenization/index.js';

import { joinTokens } from './join.js';

/**
 * A way a graph writes a single value, as the words around the value together
 * with what the graph resolves the value to.
 */
export interface ValuePattern<V> {
	/**
	 * The words written before the value.
	 */
	readonly before: string;

	/**
	 * The words written after the value.
	 */
	readonly after: string;

	/**
	 * Resolve what this way of writing the value means. The data is what the
	 * value itself would have resolved to, such as `{ value: 7 }` for a
	 * number.
	 *
	 * @param data -
	 *   the data of the value
	 * @returns
	 *   what the graph resolves this to, or `null` if it resolves to nothing
	 */
	resolve(data: any): V | null;
}

/**
 * The longest path followed while reading a graph.
 */
const MAX_LENGTH = 20;

const cache = new WeakMap<Graph<any>, ValuePattern<any>[]>();

/**
 * Read the ways a graph writes a single value, such as the `days` in
 * `7 days`. Each way comes with the words around the value, so a value can be
 * written back out without knowing the words of the language.
 *
 * Only ways that write exactly one value are read, as anything longer would
 * have to guess at how the values combine.
 *
 * @param graph -
 *   the graph to read
 * @returns
 *   the ways the graph writes a value, in the order the graph was written
 */
export function patternsFrom<V>(graph: Graph<V>): ValuePattern<V>[] {
	const cached = cache.get(graph);
	if(cached) return cached;

	const result: ValuePattern<V>[] = [];
	const visited: Node[] = [];

	const walk = (
		nodes: readonly Node[],
		before: readonly Token[],
		after: readonly Token[],
		seenValue: boolean
	) => {
		if(visited.length >= MAX_LENGTH) return;

		for(const node of nodes) {
			if(visited.includes(node)) continue;

			visited.push(node);
			try {
				if(node instanceof TokenNode) {
					if(seenValue) {
						walk(node.outgoing, before, [ ...after, node.token ], true);
					} else {
						walk(node.outgoing, [ ...before, node.token ], after, false);
					}
				} else if(node instanceof CollectorNode) {
					if(! seenValue) continue;

					const collector = node;
					result.push({
						before: joinTokens(before),
						after: joinTokens(after),
						resolve: data => {
							try {
								return collector.resolve([ data ]);
							} catch {
								// The node needs more than a single value
								return null;
							}
						}
					});
				} else if(! seenValue) {
					// The value of the phrase, whatever kind of value it is
					walk(node.outgoing, before, after, true);
				}
			} finally {
				visited.pop();
			}
		}
	};

	walk(graph.nodes, [], [], false);

	cache.set(graph, result);
	return result;
}
