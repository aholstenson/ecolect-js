import {
	addWeeks,
	getWeek,
	getWeekYear
} from 'date-fns';

import { currentTime } from './currentTime.js';
import { mapDateInterval } from './date-intervals.js';
import { DateTimeData } from './DateTimeData.js';
import { DateTimeOptions } from './DateTimeOptions.js';
import { toWeekOptions } from './weekOptions.js';

export function thisWeek(r: any, options: DateTimeOptions): DateTimeData {
	const time = currentTime(options);
	return {
		week: getWeek(time, toWeekOptions(options))
	};
}

/**
 * Describe the week a time is in, as a week number within its week
 * numbering year. Around the turn of the year the week numbering year can
 * differ from the calendar year, such as December 30th being in the first
 * week of the following year.
 *
 * @param time -
 *   the time to describe
 * @param options -
 *   options with the week numbering settings
 * @returns
 *   data with the week and its week numbering year
 */
function weekOf(time: Date, options: DateTimeOptions): DateTimeData {
	const weekOptions = toWeekOptions(options);
	return {
		year: getWeekYear(time, weekOptions),
		week: getWeek(time, weekOptions)
	};
}

export function nextWeek(r: any, options: DateTimeOptions): DateTimeData {
	return weekOf(addWeeks(currentTime(options), 1), options);
}

export function previousWeek(r: any, options: DateTimeOptions): DateTimeData {
	return weekOf(addWeeks(currentTime(options), -1), options);
}

/**
 * Map weeks as intervals.
 */
export function mapWeek(r: DateTimeData, options: DateTimeOptions) {
	return mapDateInterval({ start: r, end: r }, options);
}
