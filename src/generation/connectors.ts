import { CollectorNode, Graph, Node, TokenNode } from '../graph/index.js';
import { Token } from '../tokenization/index.js';

import { joinTokens } from './join.js';

/**
 * The most words a connector or a prefix may be made up of.
 */
const MAX_WORDS = 3;

const connectorCache = new WeakMap<Graph<any>, string[]>();
const prefixCache = new WeakMap<Graph<any>, string[]>();

/**
 * Read the words a graph writes between two values, such as the `to` in
 * `January to March`. These are the words needed to write a range back out,
 * and reading them from the graph keeps them right for every language.
 *
 * @param graph -
 *   the graph to read
 * @returns
 *   the connectors, in the order the graph was written
 */
export function connectorsFrom(graph: Graph<any>): string[] {
	const cached = connectorCache.get(graph);
	if(cached) return cached;

	const result: string[] = [];

	for(const node of graph.nodes) {
		if(node instanceof TokenNode || node instanceof CollectorNode) continue;

		// A value starts this phrase, so words after it join it to another
		collectWords(node.outgoing, result);
	}

	connectorCache.set(graph, result);
	return result;
}

/**
 * Read the words a graph writes before a value, such as the `before` in
 * `before January`. These are the words needed to write an open ended range
 * back out.
 *
 * @param graph -
 *   the graph to read
 * @returns
 *   the prefixes, in the order the graph was written
 */
export function prefixesFrom(graph: Graph<any>): string[] {
	const cached = prefixCache.get(graph);
	if(cached) return cached;

	const result: string[] = [];
	collectWords(graph.nodes, result);

	prefixCache.set(graph, result);
	return result;
}

/**
 * Gather the runs of words that lead from the given nodes to a value.
 *
 * @param nodes -
 *   the nodes to start from
 * @param result -
 *   the texts found so far, added to in place
 */
function collectWords(nodes: readonly Node[], result: string[]): void {
	const visited: Node[] = [];

	const walk = (current: readonly Node[], tokens: readonly Token[]) => {
		for(const node of current) {
			if(visited.includes(node)) continue;

			if(node instanceof TokenNode) {
				if(tokens.length >= MAX_WORDS) continue;

				visited.push(node);
				try {
					walk(node.outgoing, [ ...tokens, node.token ]);
				} finally {
					visited.pop();
				}
			} else if(! (node instanceof CollectorNode) && tokens.length > 0) {
				/*
				 * The words lead into another value, so they are what joins
				 * this phrase together.
				 */
				const text = joinTokens(tokens);
				if(! result.includes(text)) {
					result.push(text);
				}
			}
		}
	};

	walk(nodes, []);
}
