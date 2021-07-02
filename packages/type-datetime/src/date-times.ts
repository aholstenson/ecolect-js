import { LocalDateTime } from 'datetime-types';

import { mapDate } from './dates';
import { DateTimeData } from './DateTimeData';
import { DateTimeOptions } from './DateTimeOptions';
import { mapTime } from './times';

export function mapDateTime(r: DateTimeData, options: DateTimeOptions) {
	const date = mapDate(r, options);

	// If the date doesn't map, skip time mapping
	if(! date) return null;

	const time = mapTime(r, { ...options, reference: date.toDateAtMidnight() });

	return LocalDateTime.fromDateAndTime(date, time);
}
