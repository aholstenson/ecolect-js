import { DateTimeOptions } from '../time/DateTimeOptions';

/**
 * Options that can be used during matching.
 */
export interface MatchOptions extends DateTimeOptions {
	/**
	 * If fuzzy matching is being performed.
	 */
	fuzzy?: boolean;
}
