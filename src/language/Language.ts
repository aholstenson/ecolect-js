import { Token, Tokens } from './tokens';

import { Graph } from '../graph/Graph';
import { GraphBuilder } from '../graph/GraphBuilder';

import { LanguageGraphFactory } from './LanguageGraphFactory';
import { KnownGraphs, KnownGraphsDataTypes } from '../graph/KnownGraphs';

/**
 * Language usable with Ecolect.
 */
export interface Language {
	/**
	 * The identifier of the language.
	 */
	readonly id: string;

	/**
	 * Tokenize an input string.
	 *
	 * @param input
	 */
	tokenize(input: string): Tokens;

	/**
	 * Compare the similarity of two tokens.
	 *
	 * @param a
	 * @param b
	 */
	compareTokens(a: Token, b: Token): number;

	/**
	 * Compare the similarity of two tokens in the case of partial matching.
	 *
	 * @param a
	 * @param b
	 */
	comparePartialTokens(a: Token, b: Token): number;

	/**
	 * Get or create a graph.
	 *
	 * @param factory
	 */
	graph<D>(factory: LanguageGraphFactory<D>): Graph<D>;

	/**
	 * Create a repeating statement for the given graph.
	 *
	 * @param matcher
	 */
	repeating<V>(graph: Graph<V>): GraphBuilder<V[]>;

	/**
	 * Get a known graph from the language.
	 *
	 * @param id
	 */
	findGraph<K extends KnownGraphs>(id: K): Graph<KnownGraphsDataTypes[K]>;
}
