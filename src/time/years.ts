import {
	addYears,
	setYear,
	startOfYear
} from 'date-fns';

import { DateTimeEncounter } from './DateTimeEncounter';
import { currentTime } from './currentTime';
import { DateTimeData } from './DateTimeData';
import { MutableDateValue } from './date-value';
import { Period } from './Period';

export function thisYear(r: any, e: DateTimeEncounter): DateTimeData {
	return {
		year: currentTime(e.options).getFullYear()
	};
}

export function nextYear(r: any, e: DateTimeEncounter): DateTimeData {
	return {
		year: currentTime(e.options).getFullYear() + 1
	};
}

export function previousYear(r: any, e: DateTimeEncounter): DateTimeData {
	return {
		year: currentTime(e.options).getFullYear() - 1
	};
}

export function map(r: DateTimeData, e: DateTimeEncounter): MutableDateValue | null {
	const now = currentTime(e.options);

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

	// Adjust the time to the start of the year
	time = startOfYear(time);

	const result = new MutableDateValue();
	result.period = Period.Year;
	result.year = time.getFullYear();
	result.month = time.getMonth();
	result.day = time.getDate();
	return result;
}
