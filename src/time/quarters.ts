import {
	addQuarters,
	getQuarter
} from 'date-fns';

import { DateTimeEncounter } from './DateTimeEncounter';
import { DateTimeData } from './DateTimeData';

import { currentTime } from './currentTime';
import { mapDateInterval } from './date-intervals';

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
export function mapQuarter(r: DateTimeData, e: DateTimeEncounter) {
	return mapDateInterval({ start: r, end: r }, e);
}
