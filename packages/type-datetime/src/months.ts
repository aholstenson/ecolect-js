import {
	setYear,
	addMonths,
	setMonth
} from 'date-fns';
import { Month } from 'datetime-types';

import { currentTime } from './currentTime';
import { DateTimeData } from './DateTimeData';
import { DateTimeOptions } from './DateTimeOptions';

export function thisMonth(r: any, options: DateTimeOptions): DateTimeData {
	return {
		month: currentTime(options).getMonth()
	};
}

export function nextMonth(r: any, options: DateTimeOptions): DateTimeData {
	const time = addMonths(currentTime(options), 1);
	return {
		year: time.getFullYear(),
		month: time.getMonth()
	};
}

export function previousMonth(r: any, options: DateTimeOptions): DateTimeData {
	const time = addMonths(currentTime(options), -1);
	return {
		year: time.getFullYear(),
		month: time.getMonth()
	};
}

export function mapMonth(r: DateTimeData, options: DateTimeOptions): Month | null {
	let time = currentTime(options);

	if(typeof r.year !== 'undefined') {
		time = setYear(time, r.year);
	}

	if(typeof r.relativeMonths !== 'undefined') {
		time = addMonths(time, r.relativeMonths);
	} else if(typeof r.month !== 'undefined') {
		time = setMonth(time, r.month);
	} else {
		// No month available - skip it
		return null;
	}

	return Month.of(time.getMonth() + 1);
}
