import { DateTimeOptions } from '@ecolect/type-datetime';

/**
 * Options that can be used during matching.
 */
export interface MatchOptions extends DateTimeOptions {
	/**
	 * If fuzzy matching is being performed.
	 */
	fuzzy?: boolean;

	/**
	 * The locale to read the expression as, such as `en-GB`. This sets the
	 * conventions of the match, such as the order of the fields in a numeric
	 * date and the day weeks start on.
	 *
	 * Options set here are used as they are, so `dateOrder` given together
	 * with a locale wins over the order of the locale. Without a locale the
	 * conventions come from the language the matcher was created for.
	 */
	locale?: string;
}
