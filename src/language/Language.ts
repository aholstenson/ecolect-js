import { Token, Tokens } from './tokens';
import { Matcher } from '../graph/matching';
import { ValueMatcherFactory } from './ValueMatcherFactory';
import { GraphBuilder } from '../graph/GraphBuilder';

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
	 * Create and return a matcher for the given factory.
	 *
	 * @param factory
	 */
	matcher<V>(factory: ValueMatcherFactory<V>): Matcher<V | null>;

	/**
	 * Find a matcher based on its identifier. The matcher must be available
	 * for the language.
	 *
	 * @param id
	 */
	findMatcher<V>(id: string): Matcher<V> | null;

	/**
	 * Get a matcher, throwing an error if it is not available.
	 *
	 * @param id
	 */
	getMatcher<V>(id: string): Matcher<V>;

	/**
	 * Create a repeating statement for the given matcher.
	 *
	 * @param matcher
	 */
	repeating<V>(matcher: Matcher<V>): GraphBuilder<V[]>;
}
