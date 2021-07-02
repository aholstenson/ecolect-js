import { clone } from './clone';
import { DateTimeData } from './DateTimeData';
import { IntervalData, isIntervalData } from './IntervalData';
import { IntervalEdge } from './IntervalEdge';

/**
 * Check if a given result is currently relative.
 */
export function isRelative(v: DateTimeData) {
	return typeof v.relativeYears === 'number'
		|| typeof v.relativeMonths === 'number'
		|| typeof v.relativeWeeks === 'number'
		|| typeof v.relativeDays === 'number'
		|| typeof v.relativeHours === 'number'
		|| typeof v.relativeMinutes === 'number'
		|| typeof v.relativeSeconds === 'number';
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

export function isHour(v: DateTimeData): boolean {
	return v && typeof v.hour !== 'undefined' && typeof v.minute === 'undefined';
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
 * Create an interval that matches anything before the given value.
 */
export function before(value: DateTimeData): IntervalData {
	return {
		start: null,
		end: adjusted(value, -1)
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
 * Create an interval that matches anything after the given value.
 */
export function after(value: DateTimeData): IntervalData {
	return {
		start: adjusted(value, 1),
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
