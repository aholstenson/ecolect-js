import addMonths from 'date-fns/addMonths';
import addQuarters from 'date-fns/addQuarters';
import addWeeks from 'date-fns/addWeeks';
import addDays from 'date-fns/addDays';
import addYears from 'date-fns/addYears';

import setDay from 'date-fns/setDay';
import getDay from 'date-fns/getDay';

import setWeek from 'date-fns/setWeek';
import getWeek from 'date-fns/getWeek';

import setQuarter from 'date-fns/setQuarter';
import getQuarter from 'date-fns/getQuarter';

import setYear from 'date-fns/setYear';
import setMonth from 'date-fns/setMonth';
import setDate from 'date-fns/setDate';

import startOfYear from 'date-fns/startOfYear';
import startOfQuarter from 'date-fns/startOfQuarter';
import startOfWeek from 'date-fns/startOfWeek';
import startOfMonth from 'date-fns/startOfMonth';

import currentTime from './currentTime';
import DateValue from './date-value';

import { toStart, toEnd } from './intervals';

export function today(r, e) {
	const time = currentTime(e);
	return {
		day: time.getDate(),
		month: time.getMonth(),
		year: time.getFullYear()
	};
}

export function tomorrow(r, e) {
	const time = addDays(currentTime(e), 1);
	return {
		day: time.getDate(),
		month: time.getMonth(),
		year: time.getFullYear()
	};
}

export function dayAfterTomorrow(r, e) {
	const time = addDays(currentTime(e), 2);
	return {
		day: time.getDate(),
		month: time.getMonth(),
		year: time.getFullYear()
	};
}

export function yesterday(r, e) {
	const time = addDays(currentTime(e), -1);
	return {
		day: time.getDate(),
		month: time.getMonth(),
		year: time.getFullYear()
	};
}

const QUARTER = {
	field: 'quarter',

	get: getQuarter,
	set: setQuarter,

	adjuster: addYears,
	parentData: r => typeof r.year !== 'undefined'
};

const WEEK = {
	field: 'week',

	get: getWeek,
	set: setWeek,

	adjuster: addYears,
	parentData: r => typeof r.year !== 'undefined'
};

const MONTH = {
	field: 'month',

	get: d => d.getMonth(),
	set: setMonth,

	adjuster: addYears,
	parentData: r => typeof r.year !== 'undefined'
};

const DAY = {
	field: 'day',

	get: d => d.getDate(),
	set: setDate,

	adjuster: addMonths,
	parentData: r => typeof r.year !== 'undefined' || typeof r.month !== 'undefined'
};

/**
 * Adjust the current time based on a field. Implements different strategies
 * such as automatic, which tries to adjust the field forward if it's in the
 * past.
 *
 * @param {Date} time
 *   the current time
 * @param {Object} r
 *   the object containing the data
 * @param {*} def
 *   definition describing the field to modify
 */
function adjust(r, e, time, def) {
	const requested = r[def.field];
	const current = def.get(time, e.options);

	if(r.relationToCurrent === 'auto') {
		if(requested < current) {
			time = def.set(def.adjuster(time, 1, e.options), requested, e.options);
		} else {
			time = def.set(time, requested, e.options);
		}
	} else if(r.relationToCurrent === 'current-period') {
		if(def.parentData(r) && requested < current) {
			time = def.set(def.adjuster(time, 1, e.options), requested, e.options);
		} else {
			time = def.set(time, requested, e.options);
		}
	} else if(r.relationToCurrent === 'future') {
		if(requested <= current) {
			time = def.set(def.adjuster(time, 1, e.options), requested, e.options);
		} else {
			time = def.set(time, requested, e.options);
		}
	} else if(r.relationToCurrent === 'past') {
		if(requested >= current) {
			time = def.set(def.adjuster(time, -1, e.options), requested, e.options);
		} else {
			time = def.set(time, requested, e.options);
		}
	}

	return time;
}

export function map(r, e, options={}) {
	if(r instanceof Date) {
		// Special case to turn a Date into a DateValue
		const result = new DateValue(e.language);
		result.year = r.getFullYear();
		result.month = r.getMonth();
		result.day = r.getDate();
		return result;
	}

	if(! r.relationToCurrent) {
		r.relationToCurrent = 'auto';
	}

	// Resolve the current time for the encounter
	let time;
	if(r.relativeTo) {
		// If this time is relative to another time
		const sub = r.relativeTo;
		sub.relationToCurrent = r.relationToCurrent;
		sub.intervalEdge = r.intervalEdge;

		const resolvedTime = map(sub, e, options);
		if(! resolvedTime) return null;

		time = resolvedTime.toDate();
	} else {
		time = options.now || currentTime(e);
	}

	// The actual result
	const result = new DateValue(e.language);
	result.period = 'day';

	// First resolve the year
	if(typeof r.relativeYears !== 'undefined') {
		// Relative year - add the years and keep the current month and day
		result.period = 'year';
		time = addYears(time, r.relativeYears);
	} else if(typeof r.year !== 'undefined') {
		// Exact year - set the month and day to the start of year
		result.period = 'year';
		time = startOfYear(setYear(time, r.year));
	}

	// Resolve quarter if set
	if(typeof r.relativeQuarters !== 'undefined') {
		// Relative quarter - add the number of quarters, but try to keep day within quarter
		result.period = 'quarter';
		time = addQuarters(time, r.relativeQuarters);
	} else if(typeof r.quarter !== 'undefined') {
		// Exact quarter - set it and reset to start of quarter
		result.period = 'quarter';

		time = adjust(r, e, time, QUARTER);
		time = startOfQuarter(time, e.options);
	}

	// Resolve week if set
	if(typeof r.relativeWeeks !== 'undefined') {
		// Relative week - add the week, keep the week day
		result.period = 'week';
		time = addWeeks(time, r.relativeWeeks);
	} else if(typeof r.week !== 'undefined') {
		// Exact week - set it and reset to start of week
		result.period = 'week';

		time = adjust(r, e, time, WEEK);
		time = startOfWeek(time, e.options);
	}

	// Resolve the month
	if(typeof r.relativeMonths !== 'undefined') {
		// Relative month - add the months and keep the day
		result.period = 'month';
		time = addMonths(time, r.relativeMonths);
	} else if(typeof r.month !== 'undefined') {
		// Exact month - set the day to the start of the month
		result.period = 'month';

		time = adjust(r, e, time, MONTH);
		time = startOfMonth(time);
	}

	// Resolve the day
	if(typeof r.relativeDays !== 'undefined') {
		// Relative day
		result.period = 'day';
		time = addDays(time, r.relativeDays);
	} else if(typeof r.day !== 'undefined') {
		// If there is an explicit day set it
		result.period = 'day';

		time = adjust(r, e, time, DAY);
	}

	if(typeof r.dayOfWeek !== 'undefined') {
		result.period = 'day';

		const currentDayOfWeek = getDay(time);
		if(currentDayOfWeek >= r.dayOfWeek) {
			time = addWeeks(time, 1);
		}
		time = setDay(time, r.dayOfWeek);

		for(let i=1; i<r.dayOfWeekOrdinal; i++) {
			time = addWeeks(time, 1);
		}
	}

	if(r.intervalEdge === 'end') {
		// If the end of the period has been requested
		time = toEnd(time, result.period, e.options);
	} else if(r.intervalEdge === 'start') {
		// If the start of the period has been requested
		time = toStart(time, result.period, e.options);
	}

	// Move the time into the result
	result.year = time.getFullYear();
	result.month = time.getMonth();
	result.day = time.getDate();

	return result;
}
