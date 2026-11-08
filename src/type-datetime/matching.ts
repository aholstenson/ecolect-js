import { clone } from './clone.js';
import type { DateTimeData } from './DateTimeData.js';
import type { IntervalData } from './IntervalData.js';
import { isIntervalData } from './IntervalData.js';
import { IntervalEdge } from './IntervalEdge.js';
import { asTime, isPlainNumberTime } from './times.js';

/**
 * Check if a given result is currently relative.
 */
export function isRelative(v: DateTimeData) {
	return typeof v.relativeYears === 'number'
		|| typeof v.relativeQuarters === 'number'
		|| typeof v.relativeMonths === 'number'
		|| typeof v.relativeWeeks === 'number'
		|| typeof v.relativeDays === 'number'
		|| typeof v.relativeHours === 'number'
		|| typeof v.relativeMinutes === 'number'
		|| typeof v.relativeSeconds === 'number'
		|| typeof v.relativeMilliseconds === 'number';
}

export function hasMonth(v: DateTimeData) {
	if(typeof v.month === 'undefined') return false;

	if(typeof v.year !== 'undefined' && typeof v.day !== 'undefined') return false;

	return true;
}

/**
 * Get if a date represents a month, with an optional year.
 */
export function isMonth(v: DateTimeData) {
	if(typeof v.day !== 'undefined') return false;
	if(typeof v.dayOfWeek !== 'undefined') return false;
	if(typeof v.week !== 'undefined') return false;

	return typeof v.month !== 'undefined';
}

export function isWeek(v: DateTimeData) {
	if(typeof v.day !== 'undefined') return false;
	if(typeof v.dayOfWeek !== 'undefined') return false;

	return typeof v.week !== 'undefined';
}

export function hasHour(v: DateTimeData): boolean {
	return v && typeof v.hour !== 'undefined';
}

/**
 * Get if the data has an hour that can be followed by `pm`. Hour 0 is
 * midnight, so `0 pm` is not a time. An hour from 13 to 23 is read on the
 * 24-hour clock, so `22 pm` is 22:00.
 *
 * @param v -
 *   the data to check
 * @returns
 *   `true` if the hour is from 1 to 23
 */
export function hasPmHour(v: DateTimeData): boolean {
	return hasHour(v) && (v.hour as number) >= 1 && (v.hour as number) <= 23;
}

export function isHour(v: DateTimeData): boolean {
	return v && typeof v.hour !== 'undefined' && typeof v.minute === 'undefined';
}

/**
 * Combine a date and a time into a date and time. Returns `null` when the
 * two parts do not read as a date and a time together, in which case the
 * expression is better read some other way.
 *
 * @param date -
 *   the date part
 * @param time -
 *   the time part
 * @returns
 *   the combined value, or `null` if the parts do not go together
 */
export function combineDateAndTime(date: DateTimeData, time: DateTimeData): DateTimeData | null {
	/*
	 * A plain number next to a month belongs to the date, so `january 12` is
	 * the 12th and not noon on the 1st, and `january 2018` is a month in 2018
	 * and not 20:18.
	 */
	if(isMonth(date) && isPlainNumberTime(time)) return null;

	return asTime(combine(date, time));
}

/**
 * The fields of a duration, which `addDurations` adds together.
 */
const DURATION_FIELDS = [
	'relativeYears',
	'relativeQuarters',
	'relativeWeeks',
	'relativeMonths',
	'relativeDays',
	'relativeHours',
	'relativeMinutes',
	'relativeSeconds',
	'relativeMilliseconds'
] as const;

/**
 * Add two durations, such as the parts of `3 days and 2 days`. A unit that is
 * in both durations is added together, so the result is 5 days. Other fields
 * are combined as by `combine`.
 *
 * @param a -
 *   the first duration
 * @param b -
 *   the duration to add
 * @returns
 *   the sum of the durations
 */
export function addDurations(a: DateTimeData, b: DateTimeData): DateTimeData {
	const result = combine(a, b);
	for(const field of DURATION_FIELDS) {
		const first = a[field];
		const second = b[field];
		if(typeof first === 'number' && typeof second === 'number') {
			// Round away the error of binary fractions, so 0.1 + 0.2 is 0.3
			result[field] = Number.parseFloat((first + second).toPrecision(15));
		}
	}

	return result;
}

export function combine(a: DateTimeData, b: DateTimeData) {
	const result = clone(a) as any;
	for(const key of Object.keys(b)) {
		if(key === 'relative' && typeof result[key] === 'number') {
			// TODO: There's no relative key anymore - should relative keys be merged?
			result[key] += (b as any)[key];
		} else {
			result[key] = (b as any)[key];
		}
	}

	return result;
}

/**
 * Indicate that the interesting date is the end of the range.
 */
export function endOf(v: DateTimeData): DateTimeData {
	v = clone(v);
	v.intervalEdge = IntervalEdge.End;
	return v;
}

/**
 * Indicate that the interesting date is at the beginning of the range.
 */
export function startOf(v: DateTimeData): DateTimeData {
	v = clone(v);
	v.intervalEdge = IntervalEdge.Start;
	return v;
}

export function adjusted(v: DateTimeData, change: number): DateTimeData {
	v = clone(v);
	v.intervalAdjustment = change;
	return v;
}

/**
 * Create an interval between the two values. Handles the case where one or
 * both values are already an interval.
 */
export function between(start: DateTimeData | IntervalData, end?: DateTimeData | IntervalData): IntervalData {
	const resolvedEnd = (isIntervalData(end) ? end.start : end) || start || null;
	return {
		start: isIntervalData(start) ? start.start : start,
		end: resolvedEnd as DateTimeData
	};
}

/**
 * Create an interval that matches anything before the given value. A value
 * that is a longer period, such as a month, is excluded as a whole, so the
 * interval ends the day before the period starts.
 */
export function before(value: DateTimeData): IntervalData {
	return {
		start: null,
		end: adjusted({ ...value, intervalEdge: value.intervalEdge ?? IntervalEdge.Start }, -1)
	};
}

/**
 * Create an interval that matches anything before up to and including the
 * given value.
 */
export function until(value: DateTimeData): IntervalData {
	return {
		start: null,
		end: value
	};
}

/**
 * Create an interval that matches anything after the given value. A value
 * that is a longer period, such as a month, is excluded as a whole, so the
 * interval starts the day after the period ends.
 */
export function after(value: DateTimeData): IntervalData {
	return {
		start: adjusted({ ...value, intervalEdge: value.intervalEdge ?? IntervalEdge.End }, 1),
		end: null
	};
}

/**
 * Create an interval that matches the value and anything after it.
 */
export function from(value: DateTimeData): IntervalData {
	return {
		start: value,
		end: null
	};
}

export function reverse(v: DateTimeData): DateTimeData {
	const result = clone(v);

	if(result.relativeYears) {
		result.relativeYears = - result.relativeYears;
	}

	if(result.relativeQuarters) {
		result.relativeQuarters = - result.relativeQuarters;
	}

	if(result.relativeWeeks) {
		result.relativeWeeks = - result.relativeWeeks;
	}

	if(result.relativeMonths) {
		result.relativeMonths = - result.relativeMonths;
	}

	if(result.relativeDays) {
		result.relativeDays = - result.relativeDays;
	}

	if(result.relativeHours) {
		result.relativeHours = - result.relativeHours;
	}

	if(result.relativeMinutes) {
		result.relativeMinutes = - result.relativeMinutes;
	}

	if(result.relativeSeconds) {
		result.relativeSeconds = - result.relativeSeconds;
	}

	if(result.relativeMilliseconds) {
		result.relativeMilliseconds = - result.relativeMilliseconds;
	}

	return result;
}

/**
 * Mark a date as read with a word before it, such as `on` in `on friday`.
 * The given data is left as it is, as it may be shared with other parses of
 * the same tokens.
 *
 * @param v -
 *   the date
 * @returns
 *   copy of the date with the mark
 */
export function withQualifier(v: DateTimeData): DateTimeData {
	return { ...v, qualified: true };
}

/**
 * Get if a word such as `on` can be read before a date. This is only the
 * case if the date does not have such a word already.
 *
 * @param v -
 *   the date
 * @returns
 *   `true` if the date has no word such as `on` before it
 */
export function isUnqualified(v: DateTimeData): boolean {
	return v.qualified !== true;
}
