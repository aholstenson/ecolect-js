import { cloneObject } from '../utils/cloning';

/**
 * Check if a given result is currently relative.
 */
export function isRelative(v) {
	return typeof v.relativeYears === 'number'
		|| typeof v.relativeMonths === 'number'
		|| typeof v.relativeWeeks === 'number'
		|| typeof v.relativeDays === 'number'
		|| typeof v.relativeHours === 'number'
		|| typeof v.relativeMinutes === 'number'
		|| typeof v.relativeSeconds === 'number';
}

export function hasMonth(v) {
	if(typeof v.month === 'undefined') return false;

	if(typeof v.year !== 'undefined' && typeof v.day !== 'undefined') return false;

	return true;
}

/**
 * Get if a date represents a month, with an optional year.
 */
export function isMonth(v) {
	if(typeof v.day !== 'undefined') return false;
	if(typeof v.dayOfWeek !== 'undefined') return false;
	if(typeof v.week !== 'undefined') return false;

	return typeof v.month !== 'undefined';
}

export function isWeek(v) {
	if(typeof v.day !== 'undefined') return false;
	if(typeof v.dayOfWeek !== 'undefined') return false;

	return typeof v.week !== 'undefined';
}

export function combine(a, b) {
	const result = cloneObject(a);
	for(const key of Object.keys(b)) {
		if(key === 'relative' && typeof result[key] === 'number') {
			result[key] += b[key];
		} else {
			result[key] = b[key];
		}
	}

	return result;
}

/**
 * Indicate that the interesting date is the end of the range.
 */
export function endOf(v) {
	if(Array.isArray(v)) {
		v = v[0];
	}

	v = cloneObject(v);
	v.intervalEdge = 'end';
	return v;
}

/**
 * Indicate that the interesting date is at the beginning of the range.
 */
export function startOf(v) {
	if(Array.isArray(v)) {
		v = v[0];
	}

	v = cloneObject(v);
	v.intervalEdge = 'start';
	return v;
}

/**
 * Create an interval between the two values. Handles the case where one or
 * both values are already an interval.
 */
export function between(start, end) {
	if(Array.isArray(start)) {
		return between(start[0], start[1]);
	}

	return {
		start: start.start ? start.start : start,
		end: (end && end.start ? end.start : end) || start
	};
}

export function reverse(v) {
	const result = cloneObject(v[0] || v);

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
