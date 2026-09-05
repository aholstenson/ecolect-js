import { FirstWeekContainsDate, WeekOptions } from 'date-fns';

import { DateTimeOptions } from './DateTimeOptions.js';

/**
 * The subset of `date-fns` options that control how weeks are numbered.
 */
export type WeekNumberingOptions = WeekOptions & {
	firstWeekContainsDate?: FirstWeekContainsDate;
};

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
		weekStartsOn: options.weekStartsOn,
		firstWeekContainsDate: options.firstWeekContainsDate as FirstWeekContainsDate | undefined
	};
}
