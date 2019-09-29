import { DateTimeOptions } from '../../time/DateTimeOptions';

/**
 * Options that can be used during matching.
 */
export interface MatchOptions extends DateTimeOptions {
	/**
	 * If partial matching is being performed.
	 */
	partial?: boolean;

	/**
	 * If fuzzy matching is being performed.
	 */
	fuzzy?: boolean;
}
