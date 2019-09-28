import { DateValue, MutableDateValue } from './date-value';

/**
 * Convert a date into an object usable in the exported values.
 */
export function fromDate(date: Date): DateValue {
	const result = new MutableDateValue();
	result.year = date.getFullYear();
	result.month = date.getMonth();
	result.day = date.getDate();
	result.hour = date.getHours();
	result.minute = date.getMinutes();
	result.second = date.getSeconds();
	return result;
}
