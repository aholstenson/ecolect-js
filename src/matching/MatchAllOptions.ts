import { MatchOptions } from './MatchOptions.js';

/**
 * Options that can be used when matching an expression against everything
 * that matches it.
 */
export interface MatchAllOptions extends MatchOptions {
	/**
	 * The maximum number of matches to return. All of the matches are returned
	 * if this is not set.
	 */
	limit?: number;
}
