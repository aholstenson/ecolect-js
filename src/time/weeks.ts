import {
	addWeeks,
	getWeek
} from 'date-fns';

import { DateTimeEncounter } from './DateTimeEncounter';
import { DateTimeData } from './DateTimeData';

import { mapDateInterval } from './date-intervals';
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
export function mapWeek(r: DateTimeData, e: DateTimeEncounter) {
	return mapDateInterval({ start: r, end: r }, e);
}
