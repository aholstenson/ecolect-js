'use strict';

'use strict';

const addMonths = require('date-fns/add_months')
const addWeeks = require('date-fns/add_weeks');
const addDays = require('date-fns/add_days')
const addYears = require('date-fns/add_years');

const setISODay = require('date-fns/set_iso_day');
const getISODay = require('date-fns/get_iso_day');

const setISOWeek = require('date-fns/set_iso_week');
const getISOWeek = require('date-fns/get_iso_week');

const setYear = require('date-fns/set_year');
const setMonth = require('date-fns/set_month');
const setDate = require('date-fns/set_date');

const startOfYear = require('date-fns/start_of_year');
const startOfWeek = require('date-fns/start_of_week');
const startOfMonth = require('date-fns/start_of_month');

const currentTime = require('./currentTime');
const DateValue = require('./date-value');

const { toStart, toEnd } = require('./intervals');

module.exports.map = function(r, e) {
	if(r instanceof Date) {
		// Special case to turn a Date into a DateValue
		const result = new DateValue(e.language);
		result.year = r.getFullYear();
		result.month = r.getMonth();
		result.day = r.getDate();
		return result;
	}

	// Resolve the current time for the encounter
	let time = currentTime(e);

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

		if(r.week < getISOWeek(time) && ! r.past) {
			time = setISOWeek(addYears(time, 1), r.week);
		} else {
			time = setISOWeek(time, r.week);
		}

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

		if(r.month < time.getMonth() && ! r.past) {
			// The given month is before the current month - assume next year
			time = setMonth(addYears(time, 1), r.month);
		} else {
			// After current or the same month - assume this year
			time = setMonth(time, r.month);
		}

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

		if(r.day < time.getDate() && ! r.past) {
			// The given day is before the current day - assume next month
			time = setDate(addMonths(time, 1), r.day);
		} else {
			// After the current or same day - assume this month
			time = setDate(time, r.day);
		}
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
