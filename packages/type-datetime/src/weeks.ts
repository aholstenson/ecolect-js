import {
	addWeeks,
	getWeek
} from 'date-fns';

import { currentTime } from './currentTime';
import { mapDateInterval } from './date-intervals';
import { DateTimeData } from './DateTimeData';
import { DateTimeOptions } from './DateTimeOptions';

export function thisWeek(r: any, options: DateTimeOptions): DateTimeData {
	const time = currentTime(options);
	return {
		week: getWeek(time, options)
	};
}

export function nextWeek(r: any, options: DateTimeOptions): DateTimeData {
	const time = addWeeks(currentTime(options), 1);
	return {
		year: time.getFullYear(),
		week: getWeek(time,options)
	};
}

export function previousWeek(r: any, options: DateTimeOptions): DateTimeData {
	const time = addWeeks(currentTime(options), -1);
	return {
		year: time.getFullYear(),
		week: getWeek(time, options)
	};
}

/**
 * Map weeks as intervals.
 */
export function mapWeek(r: DateTimeData, options: DateTimeOptions) {
	return mapDateInterval({ start: r, end: r }, options);
}
