import DateValue from './date-value';

/**
 * Convert a date into an object usable in the exported values.
 */
export default function fromDate(date) {
	const result = new DateValue();
	result.year = date.getFullYear();
	result.month = date.getMonth();
	result.day = date.getDate();
	result.hour = date.getHours();
	result.minute = date.getMinutes();
	result.second = date.getSeconds();
	return result;
}
