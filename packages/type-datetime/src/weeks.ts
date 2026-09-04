import {
	addWeeks,
	getWeek
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

export function nextWeek(r: any, options: DateTimeOptions): DateTimeData {
	const time = addWeeks(currentTime(options), 1);
	return {
		year: time.getFullYear(),
		week: getWeek(time, toWeekOptions(options))
	};
}

export function previousWeek(r: any, options: DateTimeOptions): DateTimeData {
	const time = addWeeks(currentTime(options), -1);
	return {
		year: time.getFullYear(),
		week: getWeek(time, toWeekOptions(options))
	};
}

/**
 * Map weeks as intervals.
 */
export function mapWeek(r: DateTimeData, options: DateTimeOptions) {
	return mapDateInterval({ start: r, end: r }, options);
}
