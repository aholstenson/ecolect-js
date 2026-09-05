import {
	addYears,
	addQuarters,
	addWeeks,
	addMonths,
	addDays,

	setDay,
	getDay,

	setWeek,
	getWeek,
	startOfWeekYear,

	setQuarter,
	getQuarter,

	setYear,
	setMonth,
	setDate,

	startOfYear,
	startOfQuarter,
	startOfWeek,
	startOfMonth
} from 'date-fns';
import { LocalDate, DayOfWeek } from 'datetime-types';

import { currentTime } from './currentTime.js';
import { DateOrder } from './DateOrder.js';
import { DateTimeData } from './DateTimeData.js';
import { DateTimeOptions } from './DateTimeOptions.js';
import { IntervalEdge } from './IntervalEdge.js';
import { toStart, toEnd } from './intervals.js';
import { combine, isRelative } from './matching.js';
import { Period } from './Period.js';
import { TimeRelationship } from './TimeRelationship.js';
import { toWeekOptions } from './weekOptions.js';

export function today(r: any, options: DateTimeOptions) {
	const time = currentTime(options);
	return {
		day: time.getDate(),
		month: time.getMonth(),
		year: time.getFullYear()
	};
}

export function tomorrow(r: any, options: DateTimeOptions) {
	const time = addDays(currentTime(options), 1);
	return {
		day: time.getDate(),
		month: time.getMonth(),
		year: time.getFullYear()
	};
}

export function dayAfterTomorrow(r: any, options: DateTimeOptions) {
	const time = addDays(currentTime(options), 2);
	return {
		day: time.getDate(),
		month: time.getMonth(),
		year: time.getFullYear()
	};
}

export function yesterday(r: any, options: DateTimeOptions) {
	const time = addDays(currentTime(options), -1);
	return {
		day: time.getDate(),
		month: time.getMonth(),
		year: time.getFullYear()
	};
}

export function dayBeforeYesterday(r: any, options: DateTimeOptions) {
	const time = addDays(currentTime(options), -2);
	return {
		day: time.getDate(),
		month: time.getMonth(),
		year: time.getFullYear()
	};
}

export function withDay(r: DateTimeData, day: number) {
	return combine(r, {
		day: day
	});
}

/**
 * Add a year to the given data. A two digit year is expanded with
 * `expandYear`.
 *
 * @param r -
 *   the data to add the year to
 * @param year -
 *   the year, either two or four digits
 * @param options -
 *   options with the current time, used to expand a two digit year
 * @returns
 *   copy of the data with the year set
 */
export function withYear(r: DateTimeData, year: number, options: DateTimeOptions = {}) {
	return combine(r, {
		year: expandYear(year, options)
	});
}

/**
 * Expand a two digit year into a full year. The year is placed in the window
 * from 79 years before the current year up to 20 years after it, so in 2026
 * `18` is 2018, `46` is 2046 and `47` is 1947. Years with three or more
 * digits are returned as they are.
 *
 * @param year -
 *   the year to expand
 * @param options -
 *   options with the current time
 * @returns
 *   the full year
 */
export function expandYear(year: number, options: DateTimeOptions = {}): number {
	if(year >= 100) return year;

	const current = currentTime(options).getFullYear();
	const century = Math.floor(current / 100) * 100;

	const result = century + year;
	return result > current + 20 ? result - 100 : result;
}

/**
 * Check if the month is written before the day in the given options.
 *
 * @param options -
 *   options with the date order
 * @returns
 *   `true` if the month comes before the day
 */
function isMonthBeforeDay(options: DateTimeOptions): boolean {
	return options.dateOrder !== DateOrder.DayMonthYear;
}

/**
 * Describe a numeric month and day such as `4/12`. The order of the fields
 * is taken from `dateOrder` in the options. If the field read as the month
 * cannot be a month but the other one can, the fields are swapped, so `13/2`
 * is February 13th in every order.
 *
 * @param first -
 *   the first number
 * @param second -
 *   the second number
 * @param options -
 *   options with the date order
 * @returns
 *   data with the month and day
 */
export function numericMonthDay(first: number, second: number, options: DateTimeOptions = {}): DateTimeData {
	let month = isMonthBeforeDay(options) ? first : second;
	let day = isMonthBeforeDay(options) ? second : first;

	if(month > 12 && day <= 12) {
		const swapped = month;
		month = day;
		day = swapped;
	}

	return {
		month: month - 1,
		day: day
	};
}

/**
 * Describe a numeric date with three fields such as `1/2/2017`, `1/2/17` or
 * `2017-01-02`.
 *
 * A field with three or more digits is the year, so `2017-01-02` is read as
 * year, month and day and `1/2/2017` has the year last, whatever the date
 * order is. When every field is short the order comes from `dateOrder` in
 * the options, and the two digit year is expanded with `expandYear`.
 *
 * With the year last the month and day are read as by `numericMonthDay`,
 * so `24/1/2017` is January 24th in every order. With the year first the
 * month always comes before the day, as in ISO 8601.
 *
 * @param first -
 *   the first number
 * @param second -
 *   the second number
 * @param third -
 *   the third number
 * @param options -
 *   options with the date order and the current time
 * @returns
 *   data with the year, month and day
 */
export function numericDate(
	first: number,
	second: number,
	third: number,
	options: DateTimeOptions = {}
): DateTimeData {
	if(first >= 100 || (third < 100 && options.dateOrder === DateOrder.YearMonthDay)) {
		return {
			year: expandYear(first, options),
			month: second - 1,
			day: third
		};
	}

	return {
		...numericMonthDay(first, second, options),
		year: expandYear(third, options)
	};
}

/**
 * Describe the next occurrence of a day of week, not counting the current
 * day.
 *
 * @param day -
 *   the day of week
 * @returns
 *   data describing the day
 */
export function nextDayOfWeek(day: DayOfWeek): DateTimeData {
	return { dayOfWeek: day };
}

/**
 * Describe the most recent occurrence of a day of week, not counting the
 * current day.
 *
 * @param day -
 *   the day of week
 * @returns
 *   data describing the day
 */
export function previousDayOfWeek(day: DayOfWeek): DateTimeData {
	return { dayOfWeek: day, relationToCurrent: TimeRelationship.Past };
}

/**
 * Ordinal used with `dayOfWeek` to describe the last occurrence of a day of
 * week within the described period, such as the last Friday of a month.
 */
export const LAST_DAY_OF_WEEK = -1;

/**
 * Number of days from `from` forward to the next `day`, zero if `from`
 * already is that day.
 *
 * @param from -
 *   the date to count from
 * @param day -
 *   the day of week to find
 * @returns
 *   number of days, 0 to 6
 */
function daysForwardTo(from: Date, day: DayOfWeek): number {
	return (day - getDay(from) + 7) % 7;
}

/**
 * Number of days from `from` back to the previous `day`, zero if `from`
 * already is that day.
 *
 * @param from -
 *   the date to count from
 * @param day -
 *   the day of week to find
 * @returns
 *   number of days, 0 to 6
 */
function daysBackTo(from: Date, day: DayOfWeek): number {
	return (getDay(from) - day + 7) % 7;
}

/**
 * Check that the given data describes a date that can exist. Fields outside
 * their valid range give `null` from `mapDate` instead of a date that has
 * silently rolled over into another month or year.
 *
 * @param r -
 *   the data to check
 * @returns
 *   `true` if every field is within its range
 */
function isValid(r: DateTimeData): boolean {
	if(typeof r.month !== 'undefined' && (r.month < 0 || r.month > 11)) return false;
	if(typeof r.day !== 'undefined' && (r.day < 1 || r.day > 31)) return false;
	if(typeof r.quarter !== 'undefined' && (r.quarter < 1 || r.quarter > 4)) return false;
	if(typeof r.week !== 'undefined' && (r.week < 1 || r.week > 53)) return false;

	return true;
}

interface Adjustment {
	getField: (o: DateTimeData) => number;

	get: (date: Date, options?: DateTimeOptions) => number;
	set: (date: Date, v: number, options?: DateTimeOptions) => Date;

	adjuster: (date: Date, v: number, options?: DateTimeOptions) => Date;
	parentData: (r: DateTimeData) => boolean;
}

const QUARTER: Adjustment = {
	getField: o => o.quarter || 0,

	get: date => getQuarter(date),
	set: (date, v) => setQuarter(date, v),

	adjuster: (date, v) => addYears(date, v),
	parentData: r => typeof r.year !== 'undefined'
};

const WEEK: Adjustment = {
	getField: o => o.week || 0,

	get: (date, options = {}) => getWeek(date, toWeekOptions(options)),
	set: (date, v, options = {}) => setWeek(date, v, toWeekOptions(options)),

	adjuster: (date, v) => addYears(date, v),
	parentData: r => typeof r.year !== 'undefined'
};

const MONTH: Adjustment = {
	getField: o => o.month || 0,

	get: d => d.getMonth(),
	set: (date, v) => setMonth(date, v),

	adjuster: (date, v) => addYears(date, v),
	parentData: r => typeof r.year !== 'undefined'
};

const DAY: Adjustment = {
	getField: o => o.day || 0,

	get: d => d.getDate(),
	set: (date, v) => setDate(date, v),

	adjuster: (date, v) => addMonths(date, v),
	parentData: r => typeof r.year !== 'undefined' || typeof r.month !== 'undefined'
};

/**
 * Adjust the current time based on a field. Implements different strategies
 * such as automatic, which tries to adjust the field forward if it's in the
 * past.
 *
 * @param r -
 *   the object containing the data
 * @param relationToCurrent -
 *   how the described time relates to the current time
 * @param options -
 *   options in use for this mapping
 * @param time -
 *   the current time
 * @param def -
 *   definition describing the field to modify
 * @returns
 *   the adjusted time
 */
function adjust(
	r: DateTimeData,
	relationToCurrent: TimeRelationship,
	options: DateTimeOptions,
	time: Date,
	def: Adjustment
) {
	const requested = def.getField(r);

	if(def.parentData(r)) {
		/*
		 * The parent period is known and the time has been moved to the start
		 * of it, so the field is set as it is. Comparing with the current
		 * value would be wrong here, as the start of the period may be
		 * numbered as if it belongs to the previous period - such as January
		 * 1st being part of the last week of the previous year.
		 */
		return def.set(time, requested, options);
	}

	const current = def.get(time, options);

	if(relationToCurrent === TimeRelationship.Auto) {
		if(requested < current) {
			time = def.set(def.adjuster(time, 1, options), requested, options);
		} else {
			time = def.set(time, requested, options);
		}
	} else if(relationToCurrent === TimeRelationship.CurrentPeriod) {
		time = def.set(time, requested, options);
	} else if(relationToCurrent === TimeRelationship.Future) {
		if(requested <= current) {
			time = def.set(def.adjuster(time, 1, options), requested, options);
		} else {
			time = def.set(time, requested, options);
		}
	} else if(relationToCurrent === TimeRelationship.Past) {
		if(requested >= current) {
			time = def.set(def.adjuster(time, -1, options), requested, options);
		} else {
			time = def.set(time, requested, options);
		}
	}

	return time;
}

/**
 * Periods that `mapDate` moves to the start of when the period is given
 * explicitly, such as a named month or a specific year.
 *
 * @param period -
 *   the period to check
 * @returns
 *   `true` if the period is a year, quarter or month
 */
function isCalendarPeriod(period: Period): boolean {
	return period === Period.Year || period === Period.Quarter || period === Period.Month;
}

/**
 * Find the date for a day that does not exist in the month it was placed
 * in, such as the 31st in February or February 29th in a year that is not a
 * leap year.
 *
 * With a specific month and year there is no such date. With only a month
 * the same month is tried in the following years, as for February 29th, and
 * with only a day the following months are tried until one has the day.
 * With a relation to the past the search goes backwards instead.
 *
 * @param r -
 *   the data describing the date
 * @param relationToCurrent -
 *   how the described time relates to the current time
 * @param time -
 *   the time after the day was set, which has rolled over into the month
 *   after the intended one
 * @returns
 *   the resolved time, or `null` if the date does not exist
 */
function resolveDayOverflow(
	r: DateTimeData,
	relationToCurrent: TimeRelationship,
	time: Date
): Date | null {
	const day = r.day as number;
	const hasMonth = typeof r.month !== 'undefined';
	const hasYear = typeof r.year !== 'undefined';

	if(hasMonth && hasYear) return null;

	const intended = startOfMonth(addMonths(time, -1));
	const direction = relationToCurrent === TimeRelationship.Past ? -1 : 1;

	// Only February 29th can overflow with a fixed month, it repeats within 8 years
	const attempts = hasMonth ? 8 : 12;
	for(let i=1; i<=attempts; i++) {
		const candidate = setDate(
			hasMonth ? addYears(intended, i * direction) : addMonths(intended, i * direction),
			day
		);

		if(candidate.getDate() === day) {
			return candidate;
		}
	}

	return null;
}

export function mapDate(r: DateTimeData, options: DateTimeOptions = {}): LocalDate | null {
	if(! isValid(r)) return null;

	const relationToCurrent = r.relationToCurrent ?? TimeRelationship.Auto;

	// Resolve the current time for the encounter
	let time;
	if(r.relativeTo) {
		/*
		 * This time is relative to another time, so resolve that time first.
		 * The relation and edge described here are applied to it via a copy,
		 * so that the data given to this function is left as it is. A
		 * relation the other time describes itself, such as the previous
		 * Monday, is kept.
		 */
		const resolvedTime = mapDate({
			...r.relativeTo,
			relationToCurrent: r.relativeTo.relationToCurrent ?? relationToCurrent,
			intervalEdge: r.intervalEdge
		}, options);
		if(! resolvedTime) return null;

		time = resolvedTime.toDateAtMidnight();
	} else {
		time = options.now ?? currentTime(options);
	}

	// The actual result
	let period = Period.Day;

	// First resolve the year
	if(typeof r.relativeYears !== 'undefined') {
		// Relative year - add the years and keep the current month and day
		period = Period.Year;
		time = addYears(time, r.relativeYears);
	} else if(typeof r.year !== 'undefined') {
		// Exact year - set the month and day to the start of year
		period = Period.Year;
		time = startOfYear(setYear(time, r.year));
	}

	// Resolve quarter if set
	if(typeof r.relativeQuarters !== 'undefined') {
		// Relative quarter - add the number of quarters, but try to keep day within quarter
		period = Period.Quarter;
		time = addQuarters(time, r.relativeQuarters);
	} else if(typeof r.quarter !== 'undefined') {
		// Exact quarter - set it and reset to start of quarter
		period = Period.Quarter;

		time = adjust(r, relationToCurrent, options, time, QUARTER);
		time = startOfQuarter(time);
	}

	// Resolve week if set
	if(typeof r.relativeWeeks !== 'undefined') {
		// Relative week - add the week, keep the week day
		period = Period.Week;
		time = addWeeks(time, r.relativeWeeks);
	} else if(typeof r.week !== 'undefined') {
		// Exact week - set it and reset to start of week
		period = Period.Week;

		if(typeof r.year !== 'undefined') {
			/*
			 * Week of a specific year. Weeks are numbered within a week
			 * numbering year, which may start in late December or early
			 * January. July is always inside the year, so the first week is
			 * found from there and the requested week counted from it.
			 */
			const weekOptions = toWeekOptions(options);
			time = addWeeks(startOfWeekYear(new Date(r.year, 6, 1), weekOptions), r.week - 1);
		} else {
			time = adjust(r, relationToCurrent, options, time, WEEK);
		}

		if(getWeek(time, toWeekOptions(options)) !== r.week) {
			// The year does not have this many weeks
			return null;
		}

		time = startOfWeek(time, options);
	}

	// Resolve the month
	if(typeof r.relativeMonths !== 'undefined') {
		// Relative month - add the months and keep the day
		period = Period.Month;
		time = addMonths(time, r.relativeMonths);
	} else if(typeof r.month !== 'undefined') {
		// Exact month - set the day to the start of the month
		period = Period.Month;

		time = adjust(r, relationToCurrent, options, time, MONTH);
		time = startOfMonth(time);
	}

	// Resolve the day
	if(typeof r.relativeDays !== 'undefined') {
		// Relative day
		period = Period.Day;
		time = addDays(time, r.relativeDays);
	} else if(typeof r.day !== 'undefined') {
		// If there is an explicit day set it
		period = Period.Day;

		time = adjust(r, relationToCurrent, options, time, DAY);

		if(time.getDate() !== r.day) {
			/*
			 * The month is too short for the day, so the date has rolled
			 * over into the next month.
			 */
			const resolved = resolveDayOverflow(r, relationToCurrent, time);
			if(! resolved) return null;

			time = resolved;
		}
	}

	if(typeof r.dayOfWeek !== 'undefined') {
		const dayOfWeek = r.dayOfWeek;

		if(period === Period.Week) {
			// A day within a specific week, such as Tuesday next week
			time = setDay(time, dayOfWeek, toWeekOptions(options));
		} else if(typeof r.dayOfWeekOrdinal !== 'undefined') {
			/*
			 * A numbered occurrence within the period, such as the first or
			 * last Friday of a month. The time is currently at the start of
			 * the period.
			 */
			const start = time;
			if(r.dayOfWeekOrdinal < 0) {
				time = toEnd(time, period, options);
				time = addDays(time, -daysBackTo(time, dayOfWeek));
				time = addWeeks(time, r.dayOfWeekOrdinal + 1);
			} else {
				time = addDays(time, daysForwardTo(time, dayOfWeek));
				time = addWeeks(time, r.dayOfWeekOrdinal - 1);
			}

			if(! isRelative(r) && isCalendarPeriod(period) && toStart(time, period, options).getTime() !== toStart(start, period, options).getTime()) {
				// The period does not have that many of the day, such as a fifth Friday
				return null;
			}
		} else if(relationToCurrent === TimeRelationship.Past) {
			// The most recent occurrence, not counting the current day
			time = addDays(time, -(daysBackTo(time, dayOfWeek) || 7));
		} else {
			// The next occurrence, not counting the current day
			time = addDays(time, daysForwardTo(time, dayOfWeek) || 7);
		}

		period = Period.Day;
	}

	if(r.intervalEdge === IntervalEdge.End) {
		// If the end of the period has been requested
		time = toEnd(time, period, options);
	} else if(r.intervalEdge === IntervalEdge.Start) {
		// If the start of the period has been requested
		time = toStart(time, period, options);
	}

	if(r.intervalAdjustment) {
		// If there is an adjustment to move the interval forward or back
		time = addDays(time, r.intervalAdjustment);
	}

	// Move the time into the result
	return LocalDate.fromDate(time);
}
