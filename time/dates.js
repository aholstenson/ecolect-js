'use strict';

const addMonths = require('date-fns/addMonths')
const addWeeks = require('date-fns/addWeeks');
const addDays = require('date-fns/addDays')
const addYears = require('date-fns/addYears');

const setISODay = require('date-fns/setISODay');
const getISODay = require('date-fns/getISODay');

const setWeek = require('date-fns/setWeek');
const getWeek = require('date-fns/getWeek');

const setYear = require('date-fns/setYear');
const setMonth = require('date-fns/setMonth');
const setDate = require('date-fns/setDate');

const startOfYear = require('date-fns/startOfYear');
const startOfWeek = require('date-fns/startOfWeek');
const startOfMonth = require('date-fns/startOfMonth');

const currentTime = require('./currentTime');
const DateValue = require('./date-value');

const { toStart, toEnd } = require('./intervals');

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

module.exports.map = function(r, e, options={}) {
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
	let time = options.now || currentTime(e);

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

		const currentDayOfWeek = getISODay(time);
		if(currentDayOfWeek >= r.dayOfWeek) {
			time = addWeeks(time, 1);
		}
		time = setISODay(time, r.dayOfWeek);

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
};
