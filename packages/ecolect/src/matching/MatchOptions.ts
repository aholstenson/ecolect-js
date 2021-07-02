import { DateTimeOptions } from '@ecolect/type-datetime';

/**
 * Options that can be used during matching.
 */
export interface MatchOptions extends DateTimeOptions {
	/**
	 * If fuzzy matching is being performed.
	 */
	fuzzy?: boolean;
}
