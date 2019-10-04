import {
	setYear,
	addMonths,
	setMonth,
	startOfMonth
} from 'date-fns';

import { DateTimeEncounter } from './DateTimeEncounter';
import { DateTimeData } from './DateTimeData';

import { Period } from './Period';
import { currentTime } from './currentTime';
import { Month } from 'datetime-types';

export function thisMonth(r: any, e: DateTimeEncounter): DateTimeData {
	return {
		month: currentTime(e.options).getMonth()
	};
}

export function nextMonth(r: any, e: DateTimeEncounter): DateTimeData {
	const time = addMonths(currentTime(e.options), 1);
	return {
		year: time.getFullYear(),
		month: time.getMonth()
	};
}

export function previousMonth(r: any, e: DateTimeEncounter): DateTimeData {
	const time = addMonths(currentTime(e.options), -1);
	return {
		year: time.getFullYear(),
		month: time.getMonth()
	};
}

export function mapMonth(r: DateTimeData, e: DateTimeEncounter): Month | null {
	let time = currentTime(e.options);

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
