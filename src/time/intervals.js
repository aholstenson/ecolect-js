import startOfYear from 'date-fns/startOfYear';
import startOfQuarter from 'date-fns/startOfQuarter';
import startOfWeek from 'date-fns/startOfWeek';
import startOfMonth from 'date-fns/startOfMonth';
import startOfDay from 'date-fns/startOfDay';
import startOfHour from 'date-fns/startOfHour';
import startOfMinute from 'date-fns/startOfMinute';
import startOfSecond from 'date-fns/startOfSecond';

import endOfYear from 'date-fns/endOfYear';
import endOfQuarter from 'date-fns/endOfQuarter';
import endOfWeek from 'date-fns/endOfWeek';
import endOfMonth from 'date-fns/endOfMonth';
import endOfDay from 'date-fns/endOfDay';
import endOfHour from 'date-fns/endOfHour';
import endOfMinute from 'date-fns/endOfMinute';
import endOfSecond from 'date-fns/endOfSecond';

export function toStart(time, period, options=undefined) {
	switch(period) {
		case 'year':
			return startOfYear(time);
		case 'quarter':
			return startOfQuarter(time);
		case 'week':
			return startOfWeek(time, options);
		case 'month':
			return startOfMonth(time);
		case 'day':
			return startOfDay(time);
		case 'hour':
			return startOfHour(time);
		case 'minute':
			return startOfMinute(time);
		case 'second':
			return startOfSecond(time);
	}

	// Default case, just ignore and return full time
	return time;
}

export function toEnd(time, period, options=undefined) {
	switch(period) {
		case 'year':
			return endOfYear(time);
		case 'quarter':
			return endOfQuarter(time);
		case 'week':
			return endOfWeek(time, options);
		case 'month':
			return endOfMonth(time);
		case 'day':
			return endOfDay(time);
		case 'hour':
			return endOfHour(time);
		case 'minute':
			return endOfMinute(time);
		case 'second':
			return endOfSecond(time);
	}

	// Default case, just ignore and return full time
	return time;
}
