import { addDays } from 'date-fns';
import { DateInterval } from 'datetime-types';

import { currentTime } from './currentTime.js';
import { mapDate, today } from './dates.js';
import { DateTimeData } from './DateTimeData.js';
import { DateTimeOptions } from './DateTimeOptions.js';
import { mapDuration } from './durations.js';
import { IntervalData } from './IntervalData.js';
import { IntervalEdge } from './IntervalEdge.js';
import { toStart } from './intervals.js';
import { adjusted, reverse } from './matching.js';
import { Period } from './Period.js';
import { TimeRelationship } from './TimeRelationship.js';

/**
 * Create an interval that matches dates in the past.
 */
export function inThePast(r: any, options: DateTimeOptions) {
	return {
		start: null,
		end: adjusted(today(null, options), -1)
	};
}

/**
 * Create an interval that matches dates in the future.
 */
export function inTheFuture(r: any, options: DateTimeOptions) {
	return {
		start: adjusted(today(null, options), 1),
		end: null
	};
}

/**
 * Create an open ended interval that matches any time.
 */
export function anyTime() {
	return {
		start: null,
		end: null
	};
}

export function hasSingle(v: IntervalData) {
	return v && typeof v.start !== 'undefined' && v.start === v.end;
}

/**
 * Describe the date a time is on.
 *
 * @param time -
 *   the time to describe
 * @returns
 *   data with the year, month and day
 */
function dateOf(time: Date): DateTimeData {
	return {
		day: time.getDate(),
		month: time.getMonth(),
		year: time.getFullYear()
	};
}

/**
 * Check if a duration describes a length of time shorter than a whole day,
 * such as an amount of hours or minutes.
 *
 * @param duration -
 *   the duration to check
 * @returns
 *   `true` if any field below a day is set
 */
function hasTimeOfDay(duration: DateTimeData): boolean {
	return typeof duration.relativeHours !== 'undefined'
		|| typeof duration.relativeMinutes !== 'undefined'
		|| typeof duration.relativeSeconds !== 'undefined'
		|| typeof duration.relativeMilliseconds !== 'undefined';
}

/**
 * Create an interval that covers the given duration up to and including
 * today, as in `the last 7 days`.
 *
 * A duration of whole days covers exactly that many days, so seven days
 * ending today start six days ago. A duration that includes a time of day
 * is measured from the current time instead, so the last 24 hours reach
 * back into yesterday.
 *
 * @param duration -
 *   the length of the interval
 * @param options -
 *   options with the current time
 * @returns
 *   interval ending today
 */
export function lastDuration(duration: DateTimeData, options: DateTimeOptions): IntervalData {
	const now = currentTime(options);

	let start = mapDuration(reverse(duration)).toDate(now);
	if(! hasTimeOfDay(duration)) {
		start = addDays(start, 1);
	}

	return {
		start: dateOf(start),
		end: dateOf(now)
	};
}

/**
 * Create an interval that starts today and covers the given duration, as in
 * `the next 7 days`. The length is measured as by `lastDuration`.
 *
 * @param duration -
 *   the length of the interval
 * @param options -
 *   options with the current time
 * @returns
 *   interval starting today
 */
export function nextDuration(duration: DateTimeData, options: DateTimeOptions): IntervalData {
	const now = currentTime(options);

	let end = mapDuration(duration).toDate(now);
	if(! hasTimeOfDay(duration)) {
		end = addDays(end, -1);
	}

	return {
		start: dateOf(now),
		end: dateOf(end)
	};
}

/**
 * Create an interval that reaches from the given date up to and including
 * today, as in `since Monday`. The date is read as the most recent one that
 * matches, unless it says how it relates to the current time itself.
 *
 * @param value -
 *   the date the interval starts at
 * @param options -
 *   options with the current time
 * @returns
 *   interval ending today
 */
export function since(value: DateTimeData, options: DateTimeOptions): IntervalData {
	return {
		start: {
			...value,
			relationToCurrent: value.relationToCurrent ?? TimeRelationship.Past
		},
		end: dateOf(currentTime(options))
	};
}

/**
 * Create an interval that reaches from the start of the period the current
 * time is in up to and including today.
 *
 * @param period -
 *   the period to start at
 * @param options -
 *   options with the current time
 * @returns
 *   interval ending today
 */
function periodToDate(period: Period, options: DateTimeOptions): IntervalData {
	const now = currentTime(options);

	return {
		start: dateOf(toStart(now, period, options)),
		end: dateOf(now)
	};
}

/**
 * Create an interval from the first day of the current year up to and
 * including today.
 *
 * @param r -
 *   ignored
 * @param options -
 *   options with the current time
 * @returns
 *   interval ending today
 */
export function yearToDate(r: any, options: DateTimeOptions): IntervalData {
	return periodToDate(Period.Year, options);
}

/**
 * Create an interval from the first day of the current quarter up to and
 * including today.
 *
 * @param r -
 *   ignored
 * @param options -
 *   options with the current time
 * @returns
 *   interval ending today
 */
export function quarterToDate(r: any, options: DateTimeOptions): IntervalData {
	return periodToDate(Period.Quarter, options);
}

/**
 * Create an interval from the first day of the current month up to and
 * including today.
 *
 * @param r -
 *   ignored
 * @param options -
 *   options with the current time
 * @returns
 *   interval ending today
 */
export function monthToDate(r: any, options: DateTimeOptions): IntervalData {
	return periodToDate(Period.Month, options);
}

/**
 * Create an interval from the first day of the current week up to and
 * including today. The day a week starts on comes from the options.
 *
 * @param r -
 *   ignored
 * @param options -
 *   options with the current time and the day weeks start on
 * @returns
 *   interval ending today
 */
export function weekToDate(r: any, options: DateTimeOptions): IntervalData {
	return periodToDate(Period.Week, options);
}

/**
 * Copy the given data and give it the relation and interval edge that an edge
 * of an interval needs. A copy is made so that mapping an interval does not
 * change the data it was given, which matters as the same data may describe
 * both the start and the end of an interval.
 *
 * @param r -
 *   the data describing one edge of the interval
 * @param edge -
 *   the edge the data describes
 * @returns
 *   copy of the data with the relation and edge applied
 */
function applyRelationAndEdge(r: DateTimeData, edge: IntervalEdge): DateTimeData {
	return {
		...r,
		intervalEdge: r.intervalEdge ?? edge,
		relationToCurrent: r.relationToCurrent ?? TimeRelationship.CurrentPeriod
	};
}

/**
 * Copy the year and the month of the end of an interval into its start, for
 * intervals where they are written once at the end - such as
 * `February to March 2009` or `12 to 15 February`.
 *
 * Only a start that describes a period within the one the end gives is
 * filled in, so that a start such as `Monday` or the first day of the
 * current year keeps its own meaning when the end is a full date.
 *
 * @param start -
 *   the data describing the start of the interval
 * @param end -
 *   the data describing the end of the interval
 * @returns
 *   copy of the start with the fields taken from the end applied
 */
function withPeriodsFromEnd(start: DateTimeData, end: DateTimeData): DateTimeData {
	const result: DateTimeData = { ...start };

	const withinYear = typeof result.quarter !== 'undefined'
		|| typeof result.week !== 'undefined'
		|| typeof result.month !== 'undefined'
		|| typeof result.day !== 'undefined';

	if(typeof result.year === 'undefined' && typeof end.year !== 'undefined' && withinYear) {
		result.year = end.year;
	}

	if(typeof result.month === 'undefined' && typeof end.month !== 'undefined' && typeof result.day !== 'undefined') {
		result.month = end.month;
	}

	return result;
}

export function mapDateInterval(r: IntervalData, options: DateTimeOptions): DateInterval {
	let start = null;
	let end = null;

	if(r.end) {
		if(r.start) {
			const startData = withPeriodsFromEnd(r.start, r.end);

			start = mapDate(applyRelationAndEdge(startData, IntervalEdge.Start), options);
			if(! start) throw new Error();

			/*
			 * The end is read as if the current time was the start, so that
			 * an end that leaves out fields the start gives, such as the
			 * `15th` in `January 12th - 15th`, lands after the start. A
			 * single date describing both edges is read from the current
			 * time instead, as reading it twice would apply an offset such
			 * as `3 days ago` to itself.
			 */
			const endOptions = r.start === r.end
				? options
				: { ...options, now: start.toDateAtMidnight() };

			end = mapDate(applyRelationAndEdge(r.end, IntervalEdge.End), endOptions);
		} else {
			end = mapDate(applyRelationAndEdge(r.end, IntervalEdge.End), options);
		}
	} else {
		// This interval has no end
		if(r.start) {
			// There is a start available - map it
			start = mapDate(applyRelationAndEdge(r.start, IntervalEdge.Start), options);
		} else {
			// No start and no end, represents all time
		}
	}

	return DateInterval.between(start, end);
}
