import { DateValue } from './date-value';

export function toDate(date: DateValue, now: Date): Date {
	return new Date(
		typeof date.year !== 'undefined' ? date.year : now.getFullYear(),
		typeof date.month !== 'undefined' ? date.month : now.getMonth(),
		typeof date.day !== 'undefined' ? date.day : now.getDate(),
		typeof date.hour !== 'undefined' ? date.hour : 0,
		typeof date.minute !== 'undefined' ? date.minute : 0,
		typeof date.second !== 'undefined' ? date.second : 0,
		typeof date.millisecond !== 'undefined' ? date.millisecond : 0
	);
}
