import {
	startOfYear,
	startOfQuarter,
	startOfWeek,
	startOfMonth,
	startOfDay,
	startOfHour,
	startOfMinute,
	startOfSecond,

	endOfYear,
	endOfQuarter,
	endOfWeek,
	endOfMonth,
	endOfDay,
	endOfHour,
	endOfMinute,
	endOfSecond
} from 'date-fns';

import { Period } from './Period';
import { DateTimeOptions } from './DateTimeOptions';

export function toStart(time: Date, period: Period, options?: DateTimeOptions) {
	switch(period) {
		case Period.Year:
			return startOfYear(time);
		case Period.Quarter:
			return startOfQuarter(time);
		case Period.Week:
			return startOfWeek(time, options);
		case Period.Month:
			return startOfMonth(time);
		case Period.Day:
			return startOfDay(time);
		case Period.Hour:
			return startOfHour(time);
		case Period.Minute:
			return startOfMinute(time);
		case Period.Second:
			return startOfSecond(time);
	}

	// Default case, just ignore and return full time
	return time;
}

export function toEnd(time: Date, period: Period, options?: DateTimeOptions) {
	switch(period) {
		case Period.Year:
			return endOfYear(time);
		case Period.Quarter:
			return endOfQuarter(time);
		case Period.Week:
			return endOfWeek(time, options);
		case Period.Month:
			return endOfMonth(time);
		case Period.Day:
			return endOfDay(time);
		case Period.Hour:
			return endOfHour(time);
		case Period.Minute:
			return endOfMinute(time);
		case Period.Second:
			return endOfSecond(time);
	}

	// Default case, just ignore and return full time
	return time;
}
