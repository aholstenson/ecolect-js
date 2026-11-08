import type { MatchOptions } from './MatchOptions.js';

/**
 * Options that can be used when matching an expression against everything
 * that matches it.
 */
export interface MatchAllOptions extends MatchOptions {
	/**
	 * The maximum number of matches to return. All of the matches are returned
	 * if this is not set or is not a number, such as `NaN`. A fraction is
	 * rounded down, and `0` or less returns no matches.
	 */
	limit?: number;
}
