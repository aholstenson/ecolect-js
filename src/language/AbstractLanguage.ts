import { Language } from './Language';
import { Tokens, Token } from './tokens';
import { ValueMatcherFactory } from './ValueMatcherFactory';
import { Matcher } from '../graph/matching';
import { GraphBuilder } from '../graph/GraphBuilder';

/**
 * Abstract implementation of Language. This is the root that languages should
 * extend.
 */
export abstract class AbstractLanguage implements Language {
	private cachedMatchers: Map<string, Matcher<any>> = new Map();

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
	public abstract repeating<V>(matcher: Matcher<V>): GraphBuilder<V[]>;

	/**
	 * Create and return a matcher for the given factory.
	 *
	 * @param factory
	 */
	public matcher<V>(factory: ValueMatcherFactory<V>): Matcher<V | null> {
		const result = this.cachedMatchers.get(factory.id);
		if(result) {
			return result;
		}

		const created = factory.create(this);
		this.cachedMatchers.set(factory.id, created);
		return created;
	}

	/**
	 * Find a matcher based on its identifier. The matcher must be available
	 * for the language.
	 *
	 * @param id
	 */
	public findMatcher<V>(id: string): Matcher<V> | null {
		return this.cachedMatchers.get(id) || null;
	}

	/**
	 * Get a matcher, throwing an error if it is not available.
	 *
	 * @param id
	 */
	public getMatcher<V>(id: string): Matcher<V> {
		const result = this.cachedMatchers.get(id);
		if(! result) {
			throw new Error('No matcher with id `' + id + '` available');
		}

		return result;
	}
}
