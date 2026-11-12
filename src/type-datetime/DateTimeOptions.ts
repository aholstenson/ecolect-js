import type { DayOfWeek } from 'datetime-types';

import type { DateOrder } from './DateOrder.js';
import type { DayPartHours } from './dayParts.js';
import type { MonthDayOrder } from './MonthDayOrder.js';
import type { WeekParts } from './periodParts.js';

/**
 * Options that can be used with date and times.
 *
 * It's important to set weekStartsOn and firstWeekContainsDate to something
 * expected by the user. weekStartsOn is a `DayOfWeek`, which follows ISO 8601:
 * `DayOfWeek.MONDAY` is 1 and `DayOfWeek.SUNDAY` is 7. Without a value weeks
 * start on Sunday.
 *
 * firstWeekContainsDate defaults to 1 which is commonly used in North America
 * and Islamic date systems. Countries that use this week numbering include
 * Canada, United States, India, Japan, Taiwan, Hong Kong, Macau, Israel,
 * Egypt, South Africa, the Philippines and most of Latin America.
 *
 * For EU countries most of them use Mondays as the start of the week and the
 * ISO week system. Setting weekStartsOn to 1 and firstWeekContainsDate to 4
 * will set weeks to a style used in EU and most other European countries,
 * most of Asia and Oceania.
 *
 * Middle Eastern countries commonly use Saturday as their first day of week
 * and a week numbering system where the first week of the year contains
 * January 1st. Set weekStartsOn to 6 and firstWeekContainsDate to 1 to use
 * this style of week.
 */
export interface DateTimeOptions {
	/**
	 * The current time. If not specified this will default to `new Date()`.
	 */
	now?: Date;

	/**
	 * The day weeks start on.
	 */
	weekStartsOn?: DayOfWeek;

	/**
	 * The day of January that is always in the first week of the year.
	 */
	firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;

	/**
	 * The order of the fields in numeric dates such as `1/2/2017`. Defaults
	 * to month, day and then year as used in the United States. Dates that
	 * start with a four digit year are always read as year, month and then
	 * day.
	 */
	dateOrder?: DateOrder;

	/**
	 * The order of the month and the day in numeric dates without a year,
	 * such as `1/2`, and in dates with the year last, such as `1/2/2017`.
	 * Without a value the order comes from `dateOrder`: day first for
	 * `DateOrder.DayMonthYear` and month first for the other orders.
	 */
	monthDayOrder?: MonthDayOrder;

	/**
	 * The hours of the named parts of the day, such as `morning`, `lunch`
	 * and `end of day`, on a 24-hour clock. A part that is not set uses its
	 * default hour.
	 */
	dayParts?: Partial<DayPartHours>;

	/**
	 * The days that the parts of a week are taken from, as in
	 * `early next week` and `late next week`. Defaults to the work days,
	 * Monday to Friday, so that `late next week` is Thursday and Friday.
	 */
	weekParts?: WeekParts;
}
