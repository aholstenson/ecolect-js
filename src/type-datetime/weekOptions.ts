import type { Day, FirstWeekContainsDate, WeekOptions } from 'date-fns';
import type { DayOfWeek } from 'datetime-types';

import type { DateTimeOptions } from './DateTimeOptions.js';

/**
 * The subset of `date-fns` options that control how weeks are numbered.
 */
export type WeekNumberingOptions = WeekOptions & {
	firstWeekContainsDate?: FirstWeekContainsDate;
};

/**
 * Convert a day of week to the number that `date-fns` uses. `DayOfWeek`
 * follows ISO 8601, where Monday is 1 and Sunday is 7. `date-fns` follows
 * `Date.getDay()`, where Sunday is 0.
 *
 * @param day -
 *   the day of week
 * @returns
 *   the same day as `date-fns` counts it
 */
export function toDateFnsDay(day: DayOfWeek): Day {
	return (day % 7) as Day;
}

/**
 * Extract the week numbering settings from the given options.
 *
 * `date-fns` types `firstWeekContainsDate` as `1 | 4` - the North American and
 * the ISO system. `DateTimeOptions` allows any day from 1 to 7, which the
 * `date-fns` implementation still accepts, so the value is passed on as it is.
 *
 * @param options -
 *   the options to read
 * @returns
 *   options that can be given to the week functions in `date-fns`
 */
export function toWeekOptions(options: DateTimeOptions): WeekNumberingOptions {
	return {
		weekStartsOn: typeof options.weekStartsOn === 'undefined' ? undefined : toDateFnsDay(options.weekStartsOn),
		firstWeekContainsDate: options.firstWeekContainsDate as FirstWeekContainsDate | undefined
	};
}
