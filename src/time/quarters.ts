import {
	addQuarters,
	getQuarter
} from 'date-fns';

import { DateTimeEncounter } from './encounter';
import { DateTimeData } from './date-time-data';

import { currentTime } from './currentTime';
import { map as mapInterval } from './date-intervals';

export function thisQuarter(r: any, e: DateTimeEncounter): DateTimeData {
	const time = currentTime(e.options);
	return {
		quarter: getQuarter(time)
	};
}

export function nextQuarter(r: any, e: DateTimeEncounter): DateTimeData {
	const time = addQuarters(currentTime(e.options), 1);
	return {
		year: time.getFullYear(),
		quarter: getQuarter(time)
	};
}

export function previousQuarter(r: any, e: DateTimeEncounter): DateTimeData {
	const time = addQuarters(currentTime(e.options), -1);
	return {
		year: time.getFullYear(),
		quarter: getQuarter(time)
	};
}

/**
 * Map quarters as intervals.
 */
export function map(r: DateTimeData, e: DateTimeEncounter) {
	return mapInterval({ start: r, end: r }, e);
}
