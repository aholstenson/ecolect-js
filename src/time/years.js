import addYears from 'date-fns/addYears';
import setYear from 'date-fns/setYear';
import startOfYear from 'date-fns/startOfYear';

import currentTime from './currentTime';
import DateValue from './date-value';

export function thisYear(r, e) {
	return {
		year: currentTime(e).getFullYear()
	};
}

export function nextYear(r, e) {
	return {
		year: currentTime(e).getFullYear() + 1
	};
}

export function previousYear(r, e) {
	return {
		year: currentTime(e).getFullYear() - 1
	};
}

export function map(r, e) {
	const now = currentTime(e);

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

	const result = new DateValue(e.language);
	result.period = 'year';
	result.year = time.getFullYear();
	result.month = time.getMonth();
	result.day = time.getDate();
	return result;
}
