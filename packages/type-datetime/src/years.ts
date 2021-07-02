import {
	addYears,
	setYear
} from 'date-fns';
import { Year } from 'datetime-types';

import { currentTime } from './currentTime';
import { DateTimeData } from './DateTimeData';
import { DateTimeOptions } from './DateTimeOptions';

export function thisYear(r: any, options: DateTimeOptions): DateTimeData {
	return {
		year: currentTime(options).getFullYear()
	};
}

export function nextYear(r: any, options: DateTimeOptions): DateTimeData {
	return {
		year: currentTime(options).getFullYear() + 1
	};
}

export function previousYear(r: any, options: DateTimeOptions): DateTimeData {
	return {
		year: currentTime(options).getFullYear() - 1
	};
}

export function mapYear(r: DateTimeData, options: DateTimeOptions): Year | null {
	const now = currentTime(options);

	let time;
	if(typeof r.relativeYears !== 'undefined') {
		// Relative year
		time = addYears(now, r.relativeYears);
	} else if(typeof r.year !== 'undefined') {
		time = setYear(now, r.year);
	} else {
		// No year available - skip it
		return null;
	}

	return Year.of(time.getFullYear());
}
