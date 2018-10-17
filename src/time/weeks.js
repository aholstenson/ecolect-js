import addWeeks from 'date-fns/addWeeks';
import getWeek from 'date-fns/getWeek';

import currentTime from './currentTime';
import { map as mapInterval } from './date-intervals';

export function thisWeek(r, e) {
	const time = currentTime(e);
	return {
		week: getWeek(time, e.options)
	};
}

export function nextWeek(r, e) {
	const time = addWeeks(currentTime(e), 1);
	return {
		year: time.getFullYear(),
		week: getWeek(time, e.options)
	};
}

export function previousWeek(r, e) {
	const time = addWeeks(currentTime(e), -1);
	return {
		year: time.getFullYear(),
		week: getWeek(time, e.options)
	};
}

/**
 * Map weeks as intervals.
 */
export function map(r, e) {
	return mapInterval({ from: r, to: r }, e);
}
