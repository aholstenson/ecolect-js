import { LocalDateTime } from 'datetime-types';

import { mapDate } from './dates.js';
import { DateTimeData } from './DateTimeData.js';
import { DateTimeOptions } from './DateTimeOptions.js';
import { mapTime } from './times.js';

export function mapDateTime(r: DateTimeData, options: DateTimeOptions) {
	const date = mapDate(r, options);

	// If the date doesn't map, skip time mapping
	if(! date) return null;

	const time = mapTime(r, { ...options, reference: date.toDateAtMidnight() });

	return LocalDateTime.fromDateAndTime(date, time);
}
