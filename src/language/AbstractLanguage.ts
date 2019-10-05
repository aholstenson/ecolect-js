import { Language } from './Language';
import { Tokens, Token } from './tokens';
import { GraphBuilder } from '../graph/GraphBuilder';
import { Graph } from '../graph/Graph';
import { LanguageGraphFactory } from './LanguageGraphFactory';
import { KnownGraphs, KnownGraphsDataTypes } from '../graph/KnownGraphs';

/**
 * Abstract implementation of Language. This is the root that languages should
 * extend.
 */
export abstract class AbstractLanguage implements Language {
	private cachedGraphs: Map<string, Graph<any>> = new Map();

	/**
	 * The identifier of the language.
	 */
	public abstract readonly id: string;

	/**
	 * Tokenize an input string.
	 *
	 * @param input
	 */
	public abstract tokenize(input: string): Tokens;

	/**
	 * Compare the similarity of two tokens.
	 *
	 * @param a
	 * @param b
	 */
	public abstract compareTokens(a: Token, b: Token): number;

	/**
	 * Compare the similarity of two tokens in the case of partial matching.
	 *
	 * @param a
	 * @param b
	 */
	public abstract comparePartialTokens(a: Token, b: Token): number;

	/**
	 * Create a repeating statement for the given matcher.
	 *
	 * @param matcher
	 */
	public abstract repeating<V>(graph: Graph<V>): GraphBuilder<V[]>;

	/**
	 * Create and return a matcher for the given factory.
	 *
	 * @param factory
	 */
	public graph<V>(factory: LanguageGraphFactory<V>): Graph<V> {
		const result = this.cachedGraphs.get(factory.id);
		if(result) {
			return result;
		}

		const created = factory.create(this);
		this.cachedGraphs.set(factory.id, created);
		return created;
	}

	public findGraph<K extends KnownGraphs>(id: K): Graph<KnownGraphsDataTypes[K]> {
		const cached = this.cachedGraphs.get(id);
		if(! cached) {
			throw new Error('Graph with id `' + id + '` not available for language');
		}

		return cached as any;
	}
}
