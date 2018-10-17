import addQuarters from 'date-fns/addQuarters';
import getQuarter from 'date-fns/getQuarter';

import currentTime from './currentTime';
import { map as mapInterval } from './date-intervals';

export function thisQuarter(r, e) {
	const time = currentTime(e);
	return {
		quarter: getQuarter(time, e.options)
	};
}

export function nextQuarter(r, e) {
	const time = addQuarters(currentTime(e), 1);
	return {
		year: time.getFullYear(),
		quarter: getQuarter(time, e.options)
	};
}

export function previousQuarter(r, e) {
	const time = addQuarters(currentTime(e), -1);
	return {
		year: time.getFullYear(),
		quarter: getQuarter(time, e.options)
	};
}

/**
 * Map quarters as intervals.
 */
export function map(r, e) {
	return mapInterval({ from: r, to: r }, e);
}
