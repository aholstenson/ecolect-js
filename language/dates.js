'use strict';

const cloneDeep = require('lodash.clonedeep');

const addMonths = require('date-fns/add_months')
const addWeeks = require('date-fns/add_weeks');
const addDays = require('date-fns/add_days')
const addHours = require('date-fns/add_hours')
const addMinutes = require('date-fns/add_minutes');
const addSeconds = require('date-fns/add_seconds')
const addYears = require('date-fns/add_years');

const setISODay = require('date-fns/set_iso_day');
const getISODay = require('date-fns/get_iso_day');

const setISOWeek = require('date-fns/set_iso_week');
const getISOWeek = require('date-fns/get_iso_week');

const setYear = require('date-fns/set_year');
const setMonth = require('date-fns/set_month');
const setDate = require('date-fns/set_date');
const setHours = require('date-fns/set_hours')
const setMinutes = require('date-fns/set_minutes')
const setSeconds = require('date-fns/set_seconds')

const startOfYear = require('date-fns/start_of_year');
const startOfWeek = require('date-fns/start_of_week');
const startOfMonth = require('date-fns/start_of_month');
const startOfDay = require('date-fns/start_of_day');
const startOfHour = require('date-fns/start_of_hour');
const startOfMinute = require('date-fns/start_of_minute');
const startOfSecond = require('date-fns/start_of_second');

const endOfYear = require('date-fns/end_of_year');
const endOfWeek = require('date-fns/end_of_week');
const endOfMonth = require('date-fns/end_of_month');
const endOfDay = require('date-fns/end_of_day');
const endOfHour = require('date-fns/end_of_hour');
const endOfMinute = require('date-fns/end_of_minute');
const endOfSecond = require('date-fns/end_of_second');

module.exports.isRelative = function isRelative(v) {
	return v && (v.relativeMonths >= 0 || v.relativeWeeks >= 0 || v.relativeDays >= 0 || v.relative >= 0);
};

/**
 * Create a time in a 12-hour clock, which will guess the AM or PM.
 */
module.exports.time12h = function(hour, minute, second) {
	if(hour < 0 || hour > 24) return null;
	if(minute < 0 || minute > 60) return null;
	if(second < 0 || second > 60) return null;

	return {
		hour: hour,
		minute: minute,
		second: second,
		meridiem: hour === 0 || hour > 12 ? 'fixed' : 'auto'
	};
};

/**
 * Create a time in 24-hour clock, which will not guess AM or PM.
 */
module.exports.time24h = function(hour, minute, second) {
	if(hour < 0 || hour > 24) return null;
	if(minute < 0 || minute > 60) return null;
	if(second < 0 || second > 60) return null;

	return {
		hour: hour,
		minute: minute,
		second: second,
		meridiem: 'fixed'
	};
};

/**
 * Switch the given time to PM.
 */
module.exports.toPM = function(time) {
	time.meridiem = 'pm';
	return time;
};

/**
 * Switch the given time to AM.
 */
module.exports.toAM = function(time) {
	time.meridiem = 'am';
	return time;
};

module.exports.combine = function(a, b) {
	const result = cloneDeep(a);
	for(const key of Object.keys(b)) {
		if(key === 'relative' && typeof result[key] === 'number') {
			result[key] += b[key];
		} else {
			result[key] = b[key];
		}
	}

	return result;
};

module.exports.endOf = function(v) {
	if(Array.isArray(v)) {
		v = v[0];
	}

	v.intervalEdge = 'end';
	return v;
};

module.exports.startOf = function(v) {
	if(Array.isArray(v)) {
		v = v[0];
	}

	v.intervalEdge = 'start';
	return v;
};

function toStart(time, period, options=undefined) {
	switch(period) {
		case 'year':
			return startOfYear(time);
		case 'week':
			return startOfWeek(time, options);
		case 'month':
			return startOfMonth(time);
		case 'day':
			return startOfDay(time);
		case 'hour':
			return startOfHour(time);
		case 'minute':
			return startOfMinute(time);
		case 'second':
			return startOfSecond(time);
	}

	// Default case, just ignore and return full time
	return time;
}

function toEnd(time, period, options=undefined) {
	switch(period) {
		case 'year':
			return endOfYear(time);
		case 'week':
			return endOfWeek(time, options);
		case 'month':
			return endOfMonth(time);
		case 'day':
			return endOfDay(time);
		case 'hour':
			return endOfHour(time);
		case 'minute':
			return endOfMinute(time);
		case 'second':
			return endOfSecond(time);
	}

	// Default case, just ignore and return full time
	return time;
}

function currentTime(encounter) {
	if(encounter.options.now) {
		return encounter.options.now;
	} else {
		return encounter.options.now = new Date();
	}
}
module.exports.currentTime = currentTime;

function toDate(date, now) {
	return new Date(
		typeof date.year !== 'undefined' ? date.year : now.getFullYear(),
		typeof date.month !== 'undefined' ? date.month : now.getMonth(),
		typeof date.day !== 'undefined' ? date.day : now.getDate(),
		typeof date.hour !== 'undefined' ? date.hour : 0,
		typeof date.minute !== 'undefined' ? date.minute : 0,
		typeof date.second !== 'undefined' ? date.second : 0
	);
}

module.exports.toDate = toDate;

function mapYear(r, e) {
	const now = module.exports.currentTime(e);

	let time;
	if(typeof r.relativeYears !== 'undefined') {
		// Relative year
		time = addYears(now, r.relativeYears);
	} else if(typeof r.year !== 'undefined') {
		time = setYear(now, r.year);
	} else {
		// No year available - skip it
		return null;
	}

	// Adjust the time to the start of the year
	time = startOfYear(time);

	const result = new DateValue(e.language);
	result.period = 'year';
	result.year = time.getFullYear();
	result.month = time.getMonth();
	result.day = time.getDate();
	return result;
}

module.exports.mapYear = mapYear;

function mapMonth(r, e) {
	const now = module.exports.currentTime(e);

	let time;
	if(typeof r.relativeMonths !== 'undefined') {
		time = addMonths(now, r.relativeMonths);
	} else if(typeof r.month !== 'undefined') {
		time = setMonth(now, r.month)
	} else {
		// No month available - skip it
		return null;
	}

	// Set the time to the start of the month
	time = startOfMonth(time);

	const result = new DateValue(e.language);
	result.period = 'month';
	result.year = time.getFullYear();
	result.month = time.getMonth();
	result.day = time.getDate();
	return result;
}
module.exports.mapMonth = mapMonth;

function resolveDate(r, e) {
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
}

module.exports.mapDate = resolveDate;

function resolveTime(r, e, now, result) {
	result = result || new DateValue(e.language);

	let current = currentTime(e);
	let time = current;
	if(! now) {
		now = current;
	}

	if(typeof r.relativeHours !== 'undefined') {
		result.period = 'hour';

		time = addHours(time, r.relativeHours);
	} else if(typeof r.hour !== 'undefined') {
		result.period = 'hour';

		if(r.hour > 12) {
			// Always force fixed meridiem when hours are > 12
			r.meridiem = 'fixed';
		}

		// Hours are a bit special and require some special meridiem handling
		let hourToSet;
		if(r.meridiem === 'auto') {
			// Automatic meridiem
			const hour12 = now.getHours() % 12 || 12;
			if(r.hour < hour12 || (now.getHours() > 12 && r.hour ===  12)) {
				// Requested time is before the current hour - adjust forward in time
				hourToSet = r.hour + 12;
			} else {
				hourToSet = now.getHours() <= 12 ? r.hour : (r.hour + 12);
			}
		} else if(r.meridiem === 'am') {
			// AM meridiem - time set is hours directly
			hourToSet = r.hour === 12 ? 0 : r.hour;
		} else if(r.meridiem === 'pm') {
			// PM meridiem - time to set is hours + 12
			hourToSet = r.hour === 12 ? 12 : (r.hour + 12);
		} else {
			// Assume fixed meridiem
			hourToSet = r.hour;
		}

		// TODO: Move time ahead by a day?
		time = setHours(time, hourToSet);

		time = startOfHour(time);
	}

	if(typeof r.relativeMinutes !== 'undefined') {
		result.period = 'minute';

		time = addMinutes(time, r.relativeMinutes);
	} else if(typeof r.minute !== 'undefined') {
		result.period = 'minute';

		if(r.minute < time.getMinutes() && ! r.past) {
			// The given minute is before the current minute - assume next hour
			time = setMinutes(addHours(time, 1), r.minute);
		} else {
			// Treat as same hour
			time = setMinutes(time, r.minute);
		}

		time = startOfMinute(time);
	}

	if(typeof r.relativeSeconds !== 'undefined') {
		result.period = 'second';

		time = addSeconds(time, r.relativeSeconds);
	} else if(typeof r.second !== 'undefined') {
		result.period = 'second';

		if(r.second < time.getSeconds() && ! r.past) {
			// The given second is before the current second - assume next minute
			time = setSeconds(addMinutes(time, 1), r.second);
		} else {
			// Treat as same minute
			time = setSeconds(time, r.second);
		}
	}

	result.hour = time.getHours();
	result.minute = time.getMinutes();
	result.second = time.getSeconds();
	result.precision = r.precision || result.precision || 'normal';

	return result;
}

module.exports.mapTime = resolveTime;

module.exports.mapDateTime = function(r, e) {
	const result = resolveDate(r, e);

	return resolveTime(r, e, result.toDate(), result);
}

module.exports.weekRange = function() {

}

function range(from, to) {
	if(Array.isArray(from)) {
		return range(from[0], from[1]);
	}

	return {
		from: from.from ? from.from : from,
		to: to && to.from ? to.from : to
	};
}
module.exports.range = range;

module.exports.mapDateRange = function(r, e) {
	const from = resolveDate(r.from, e);
	let to;
	if(r.to) {
		r.to.intervalEdge = 'end';
		to = resolveDate(r.from, e);

	} else {
		r.from.intervalEdge = 'end';
		to = resolveDate(r.from, e);
	}

	return new RangeValue(from, to);
};

class DateValue {
	constructor(language) {
		Object.defineProperty(this, 'language', {
			value: language
		});
	}

	toDate(now) {
		return module.exports.toDate(this, now || new Date());
	}
}

class RangeValue {

	constructor(from, to) {
		this.from = from;
		this.to = to;
	}

	toStartDate() {
		return this.from.toDate();
	}

	toEndDate() {
		return this.to.toDate();
	}
}
