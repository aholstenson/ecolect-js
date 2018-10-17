import setYear from 'date-fns/setYear';

import addMonths from 'date-fns/addMonths';
import setMonth from 'date-fns/setMonth';
import startOfMonth from 'date-fns/startOfMonth';

import currentTime from './currentTime';
import DateValue from './date-value';

export function thisMonth(r, e) {
	return {
		month: currentTime(e).getMonth()
	};
}

export function nextMonth(r, e) {
	const time = addMonths(currentTime(e), 1);
	return {
		year: time.getFullYear(),
		month: time.getMonth()
	};
}

export function previousMonth(r, e) {
	const time = addMonths(currentTime(e), -1);
	return {
		year: time.getFullYear(),
		month: time.getMonth()
	};
}

export function map(r, e) {
	let time = currentTime(e);

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

	// Set the time to the start of the month
	time = startOfMonth(time);

	const result = new DateValue(e.language);
	result.period = 'month';
	result.year = time.getFullYear();
	result.month = time.getMonth();
	result.day = time.getDate();
	return result;
}
