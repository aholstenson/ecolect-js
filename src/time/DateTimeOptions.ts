import { Weekday } from './Weekday';

/**
 * Options that can be used with date and times.
 *
 * It's important to set weekStartsOn and firstWeekContainsDate to something
 * expected by the user. The default value for weekStartsOn is 0 which
 * indicates that weeks start on Sunday.
 *
 * firstWeekContainsDate defaults to 1 which is commonly used in North America
 * and Islamic date systems. Countries that use this week numbering include
 * Canada, United States, India, Japan, Taiwan, Hong Kong, Macau, Israel,
 * Egypt, South Africa, the Philippines and most of Latin America.
 *
 * For EU countries most of them use Mondays as the start of the week and the
 * ISO week system. Settings weekStartsOn to 1 and firstWeekContainsDate to 4
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
	weekStartsOn?: Weekday;

	/**
	 * The day of January that is always in the first week of the year.
	 */
	firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}
