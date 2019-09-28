import {
	addWeeks,
	getWeek
} from 'date-fns';

import { DateTimeEncounter } from './encounter';
import { DateTimeData } from './date-time-data';

import { map as mapInterval } from './date-intervals';
import { currentTime } from './currentTime';

export function thisWeek(r: any, e: DateTimeEncounter): DateTimeData {
	const time = currentTime(e.options);
	return {
		week: getWeek(time, e.options)
	};
}

export function nextWeek(r: any, e: DateTimeEncounter): DateTimeData {
	const time = addWeeks(currentTime(e.options), 1);
	return {
		year: time.getFullYear(),
		week: getWeek(time, e.options)
	};
}

export function previousWeek(r: any, e: DateTimeEncounter): DateTimeData {
	const time = addWeeks(currentTime(e.options), -1);
	return {
		year: time.getFullYear(),
		week: getWeek(time, e.options)
	};
}

/**
 * Map weeks as intervals.
 */
export function map(r: DateTimeData, e: DateTimeEncounter) {
	return mapInterval({ start: r, end: r }, e);
}
