import { MatchAllOptions } from './MatchAllOptions.js';
import { MatchOptions } from './MatchOptions.js';

/**
 * Matcher that can match expressions against a graph.
 */
export interface Matcher<V> {
	/**
	 * Match against the given expression.
	 *
	 * @param expression
	 * @param options
	 * @returns
	 */
	match(expression: string, options?: MatchOptions): Promise<V | null>;

	/**
	 * Match against the given expression, returning everything that matches
	 * the whole expression. Use this to let the user pick between the things
	 * an expression can mean, such as `Orders` and `Orders for Test`.
	 *
	 * The matches are ordered by score, with the best match first.
	 *
	 * @param expression -
	 *   the expression to match
	 * @param options -
	 *   options for this match, such as the maximum number of matches to
	 *   return
	 * @returns
	 *   the matches, best one first
	 */
	matchAll(expression: string, options?: MatchAllOptions): Promise<V[]>;

	/**
	 * Perform a partial match against the given expression.
	 *
	 * @param expression
	 * @param options
	 */
	matchPartial(expression: string, options?: MatchOptions): Promise<V[]>;
}
