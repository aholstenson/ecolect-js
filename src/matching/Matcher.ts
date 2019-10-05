import { MatchOptions } from './MatchOptions';

/**
 * Matcher that can match expressions against a graph.
 */
export interface Matcher<V> {
	/**
	 * Match against the given expression.
	 *
	 * @param expression
	 * @param options
	 * @return
	 */
	match(expression: string, options?: MatchOptions): Promise<V | null>;

	/**
	 * Perform a partial match against the given expression.
	 *
	 * @param expression
	 * @param options
	 */
	matchPartial(expression: string, options?: MatchOptions): Promise<V[]>;
}
