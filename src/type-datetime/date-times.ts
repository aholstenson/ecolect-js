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
	const isToday = date.equals(LocalDate.fromDate(now));
	const reference = isToday ? now : date.toDateAtMidnight();

	/*
	 * The time is read on the day of the date, at the current time of day.
	 * Reading it on the current day and then moving it to the date would
	 * give a different time when the current day has a daylight saving time
	 * change, such as 3:30 for 2:30 when the clocks skip that hour today.
	 */
	const base = isToday ? now : onDay(date, now);
	const time = mapTimeToInstant(r, { ...options, now: base, reference, stayOnDay: hasDate(r) });

	// An amount such as "in 9999999999 hours" moves past the times a Date can hold
	if(isNaN(time.getTime())) return null;

	/*
	 * The time starts at the base. When it passes midnight, for example with
	 * "in 2 hours" late in the evening, move the date by the same days.
	 */
	const days = differenceInCalendarDays(time, base);
	const day = days === 0 ? date : date.add({ days });

	return LocalDateTime.fromDateAndTime(day, LocalTime.fromDate(time));
}

/**
 * Get the instant on a date that has the same time of day as another
 * instant.
 *
 * @param date -
 *   the date
 * @param time -
 *   the instant to take the time of day from
 * @returns
 *   the instant on the date
 */
function onDay(date: LocalDate, time: Date): Date {
	// `setFullYear` also reads the years 0 to 99 as they are
	const result = new Date(time.getTime());
	result.setFullYear(date.year, date.month - 1, date.day);
	result.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
	return result;
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
