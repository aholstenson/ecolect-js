import type { DateTimeOptions } from '../type-datetime/DateTimeOptions.js';
import type { AmbiguousSeparator, NumberSeparatorMode } from '../type-numbers/separators.js';

/**
 * How weeks are numbered. `iso` is the system of ISO 8601, where the first
 * week of the year is the first one with four days in it. `first-day` is the
 * system where the first week is the one with January 1st in it.
 */
export type WeekNumbering = 'iso' | 'first-day';

/**
 * Settings of a language, as plain data that can be stored as JSON. They say
 * which locale to read expressions as, and set options that the language
 * uses for every match that does not set them.
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
	 * The locale to read expressions as, as a BCP 47 language tag such as
	 * `en-GB`. `auto` reads the locale from the JavaScript runtime. Without
	 * it the locale of the language is used, such as `en-US` for English.
	 */
	readonly locale?: string;

	/**
	 * The region of the user, such as `SE`. It replaces the region of the
	 * locale, so `en-US` with the region `SE` is read as `en-SE`. Use it
	 * when the user picks a region, or when the runtime does not report the
	 * one they have set.
	 */
	readonly region?: string;

	/**
	 * If the region is read from the time zone of the runtime when the
	 * locale is `auto`, so that `Europe/Stockholm` gives the region `SE`.
	 * This is a guess, as a person on a trip is in the time zone of another
	 * region. `auto`, the default, does it in WebKit only, as WebKit does
	 * not report the region of the user. A `region` wins over the guess.
	 */
	readonly regionFromTimeZone?: boolean | 'auto';

	/**
	 * How weeks are numbered, as a name for `firstWeekContainsDate`: `iso`
	 * is 4 and `first-day` is 1. A `firstWeekContainsDate` wins over it.
	 */
	readonly weekNumbering?: WeekNumbering;

	/**
	 * The days of the weekend. See `weekend` in the options of a match.
	 */
	readonly weekend?: DateTimeOptions['weekend'];

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
	 * of a match. A match that sets `dayParts` only replaces the parts it names.
	 */
	readonly dayParts?: DateTimeOptions['dayParts'];

	/**
	 * The days that the parts of a week are taken from. See `weekParts` in
	 * the options of a match.
	 */
	readonly weekParts?: DateTimeOptions['weekParts'];
}
