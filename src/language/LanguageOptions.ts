import type { DateTimeOptions } from '../type-datetime/DateTimeOptions.js';
import type { AmbiguousSeparator, NumberSeparatorMode } from '../type-numbers/separators.js';

/**
 * Options that a language uses for every match that does not set them.
 *
 * The options for numbers change what the locale gives instead of replacing
 * it, so they work with every locale a match is read as.
 *
 * The options for dates and times are settings of the user, such as the day
 * that weeks start on. They win over the locale, also when a match sets a
 * locale of its own. Use them when the locale of the runtime does not say
 * what the user has set, as in a web view that only reports `en-US`.
 */
export interface LanguageOptions {
	/**
	 * How to read the separator that the locale does not use for fractions.
	 * See `numberSeparators` in the options of a match.
	 */
	readonly numberSeparators?: NumberSeparatorMode;

	/**
	 * How to read a separator that can both group digits and separate a
	 * fraction. See `ambiguousSeparator` in the options of a match.
	 */
	readonly ambiguousSeparator?: AmbiguousSeparator;

	/**
	 * The day weeks start on. See `weekStartsOn` in the options of a match.
	 */
	readonly weekStartsOn?: DateTimeOptions['weekStartsOn'];

	/**
	 * The day of January that is always in the first week of the year. See
	 * `firstWeekContainsDate` in the options of a match.
	 */
	readonly firstWeekContainsDate?: DateTimeOptions['firstWeekContainsDate'];

	/**
	 * The order of the fields in a numeric date. See `dateOrder` in the
	 * options of a match.
	 */
	readonly dateOrder?: DateTimeOptions['dateOrder'];

	/**
	 * The order of the month and the day in a numeric date without a year.
	 * See `monthDayOrder` in the options of a match.
	 */
	readonly monthDayOrder?: DateTimeOptions['monthDayOrder'];

	/**
	 * The hours of the named parts of the day. See `dayParts` in the options
	 * of a match. A match that sets `dayParts` replaces all of these hours.
	 */
	readonly dayParts?: DateTimeOptions['dayParts'];

	/**
	 * The days that the parts of a week are taken from. See `weekParts` in
	 * the options of a match.
	 */
	readonly weekParts?: DateTimeOptions['weekParts'];
}
