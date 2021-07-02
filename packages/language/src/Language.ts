import { Graph, GraphBuilder } from '@ecolect/graph';
import { TokenComparer, Tokenizer } from '@ecolect/tokenization';

import { KnownGraphs, KnownGraphsDataTypes } from './KnownGraphs';
import { LanguageGraphFactory } from './LanguageGraphFactory';

/**
 * Language usable with Ecolect.
 */
export interface Language {
	/**
	 * The identifier of the language.
	 */
	readonly id: string;

	readonly tokenizer: Tokenizer;

	readonly tokenComparer: TokenComparer;

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
