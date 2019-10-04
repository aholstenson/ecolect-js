import {
	addYears,
	setYear,
	startOfYear
} from 'date-fns';

import { DateTimeEncounter } from './DateTimeEncounter';
import { currentTime } from './currentTime';
import { DateTimeData } from './DateTimeData';
import { Year } from 'datetime-types';

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

export function mapYear(r: DateTimeData, e: DateTimeEncounter): Year | null {
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

	return Year.of(time.getFullYear());
}
