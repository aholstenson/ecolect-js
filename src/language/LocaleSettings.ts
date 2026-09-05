import { DateOrder, DateTimeOptions } from '../type-datetime/index.js';

/**
 * The day weeks start on, as `DateTimeOptions` counts days.
 */
export type WeekStartsOn = NonNullable<DateTimeOptions['weekStartsOn']>;

/**
 * The day of January that is always in the first week of the year, as
 * `DateTimeOptions` counts days.
 */
export type FirstWeekContainsDate = NonNullable<DateTimeOptions['firstWeekContainsDate']>;

/**
 * The conventions that a region writes dates and numbers with. These belong
 * to the person writing the expression and not to the language they write
 * it in, so `en-GB` and `en-US` share a language but not these settings.
 *
 * Use {@link resolveLocale} to get the settings of a locale.
 */
export interface LocaleSettings {
	/**
	 * The order of the fields in numeric dates such as `1/2/2017`.
	 */
	readonly dateOrder: DateOrder;

	/**
	 * The day weeks start on.
	 */
	readonly weekStartsOn: WeekStartsOn;

	/**
	 * The day of January that is always in the first week of the year.
	 */
	readonly firstWeekContainsDate: FirstWeekContainsDate;

	/**
	 * The character that separates the whole part of a number from its
	 * fraction, such as `.` in `1.5` or `,` in `1,5`.
	 */
	readonly decimalSeparator: string;

	/**
	 * The character that groups the digits of large numbers, such as `,` in
	 * `1,000`. This is an empty string for locales that do not group digits.
	 */
	readonly groupSeparator: string;
}
