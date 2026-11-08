import { LocalDate, LocalDateTime } from 'datetime-types';

import { currentTime } from './currentTime.js';
import { mapDate } from './dates.js';
import type { DateTimeData } from './DateTimeData.js';
import type { DateTimeOptions } from './DateTimeOptions.js';
import { mapTime } from './times.js';

export function mapDateTime(r: DateTimeData, options: DateTimeOptions) {
	const date = mapDate(r, options);

	// If the date doesn't map, skip time mapping
	if(! date) return null;

	/*
	 * A bare hour such as "at 9" is the next time that hour occurs. On the
	 * current day this is from now on. On another day the hour is read from
	 * the start of that day, so that it is a time in the morning.
	 */
	const now = currentTime(options);
	const reference = date.equals(LocalDate.fromDate(now)) ? now : date.toDateAtMidnight();
	const time = mapTime(r, { ...options, reference });

	return LocalDateTime.fromDateAndTime(date, time);
}
