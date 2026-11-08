import { differenceInCalendarDays } from 'date-fns';
import { LocalDate, LocalDateTime, LocalTime } from 'datetime-types';

import { currentTime } from './currentTime.js';
import { mapDate } from './dates.js';
import type { DateTimeData } from './DateTimeData.js';
import type { DateTimeOptions } from './DateTimeOptions.js';
import { mapTimeToInstant } from './times.js';

export function mapDateTime(r: DateTimeData, options: DateTimeOptions) {
	const date = mapDate(r, options);

	// If the date doesn't map, skip time mapping
	if(! date) return null;

	/*
	 * A bare hour such as "at 9" is the next time that hour occurs. On the
	 * current day this is from now on, and an hour that has passed moves to
	 * the next day, unless the expression names the day. On another day the
	 * hour is read from the start of that day, so that it is a time in the
	 * morning.
	 */
	const now = currentTime(options);
	const reference = date.equals(LocalDate.fromDate(now)) ? now : date.toDateAtMidnight();
	const time = mapTimeToInstant(r, { ...options, reference, stayOnDay: hasDate(r) });

	// An amount such as "in 9999999999 hours" moves past the times a Date can hold
	if(isNaN(time.getTime())) return null;

	/*
	 * The time starts at now. When it passes midnight, for example with
	 * "in 2 hours" late in the evening, move the date by the same days.
	 */
	const days = differenceInCalendarDays(time, now);
	const day = days === 0 ? date : date.add({ days });

	return LocalDateTime.fromDateAndTime(day, LocalTime.fromDate(time));
}

/**
 * Get if the data names a date, such as `today` or `march 3`, and not only a
 * time of day.
 *
 * @param r -
 *   the parsed data
 * @returns
 *   `true` if the data has a date part
 */
function hasDate(r: DateTimeData): boolean {
	return typeof r.year !== 'undefined'
		|| typeof r.quarter !== 'undefined'
		|| typeof r.week !== 'undefined'
		|| typeof r.month !== 'undefined'
		|| typeof r.day !== 'undefined'
		|| typeof r.dayOfWeek !== 'undefined'
		|| typeof r.relativeYears !== 'undefined'
		|| typeof r.relativeQuarters !== 'undefined'
		|| typeof r.relativeWeeks !== 'undefined'
		|| typeof r.relativeMonths !== 'undefined'
		|| typeof r.relativeDays !== 'undefined'
		|| typeof r.relativeTo !== 'undefined';
}
