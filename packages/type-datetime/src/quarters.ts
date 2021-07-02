import {
	addQuarters,
	getQuarter
} from 'date-fns';

import { currentTime } from './currentTime';
import { mapDateInterval } from './date-intervals';
import { DateTimeData } from './DateTimeData';
import { DateTimeOptions } from './DateTimeOptions';

export function thisQuarter(r: any, options: DateTimeOptions): DateTimeData {
	const time = currentTime(options);
	return {
		quarter: getQuarter(time)
	};
}

export function nextQuarter(r: any, options: DateTimeOptions): DateTimeData {
	const time = addQuarters(currentTime(options), 1);
	return {
		year: time.getFullYear(),
		quarter: getQuarter(time)
	};
}

export function previousQuarter(r: any, options: DateTimeOptions): DateTimeData {
	const time = addQuarters(currentTime(options), -1);
	return {
		year: time.getFullYear(),
		quarter: getQuarter(time)
	};
}

/**
 * Map quarters as intervals.
 */
export function mapQuarter(r: DateTimeData, options: DateTimeOptions) {
	return mapDateInterval({ start: r, end: r }, options);
}
