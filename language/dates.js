'use strict';

const cloneDeep = require('lodash.clonedeep');

const addMonths = require('date-fns/add_months')
const addWeeks = require('date-fns/add_weeks');
const addDays = require('date-fns/add_days')
const addHours = require('date-fns/add_hours')
const addSeconds = require('date-fns/add_seconds')

const setISODay = require('date-fns/set_iso_day');
const getISODay = require('date-fns/get_iso_day');
const setHours = require('date-fns/set_hours')
const setMinutes = require('date-fns/set_minutes')
const setSeconds = require('date-fns/set_seconds')

const isSameDay = require('date-fns/is_same_day');

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
		second: second || 0,
		meridiem: hour === 0 ? 'fixed' : 'auto'
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
		second: second || 0,
		meridiem: 'fixed'
	};
};

/**
 * Switch the given time to PM.
 */
module.exports.toPM = function(time) {
	const hour = time.hour;
	if(hour >= 0 && hour < 12) {
		time.hour += 12;
	}
	time.meridiem = 'fixed';
	return time;
};

/**
 * Switch the given time to AM.
 */
module.exports.toAM = function(time) {
	const hour = time.hour;
	if(hour >= 12) {
		time.hour -= 12;
	}
	time.meridiem = 'fixed';
	return time;
};

module.exports.combine = function(a, b) {
	const result = cloneDeep(a);
	Object.keys(b).forEach(key => result[key] = b[key]);

	if(a.relative >= 0) {
		result.relative += a.relative;
	}

	return result;
};

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
	const result = new DateValue(e.language);

	if(typeof r.relativeYear !== 'undefined') {
		result.year = now.getFullYear() + r.relativeYear;
		result.month = now.getMonth();
	}

	if(typeof r.relativeMonths !== 'undefined') {
		const time = addMonths(toDate(result, now), r.relativeMonths);
		result.year = time.getFullYear();
		result.month = time.getMonth();
	}

	if(typeof r.year !== 'undefined') {
		result.year = r.year;
	}

	if(typeof r.month !== 'undefined') {
		result.month = r.month;
	}

	return result;
}

module.exports.mapYear = mapYear;
module.exports.mapMonth = mapYear;

function resolveDate(r, e) {
	const result = mapYear(r, e);

	const now = toDate(result, currentTime(e));

	if(typeof result.year === 'undefined') {
		result.year = now.getFullYear();
	}

	if(typeof result.month === 'undefined') {
		result.month = now.getMonth();
	}

	if(typeof r.relativeDays !== 'undefined') {
		const date = addDays(toDate(result, now), r.relativeDays);
		result.year = date.getFullYear();
		result.month = date.getMonth();
		result.day = date.getDate();
	} else {
		if(typeof r.day !== 'undefined') {
			result.day = r.day;
		} else {
			result.day = now.getDate();
		}
	}


	if(typeof r.dayOfWeek !== 'undefined') {
		if(typeof r.month === 'undefined') {
			// Reset to first month
			result.month = 0;
		}

		if(typeof r.day === 'undefined') {
			// Reset to first day
			result.day = 1;
		}

		let date = toDate(result, now);

		const currentDayOfWeek = getISODay(date);
		if(currentDayOfWeek > r.dayOfWeek) {
			date = addWeeks(date, 1);
		}
		date = setISODay(date, r.dayOfWeek);

		for(let i=1; i<r.dayOfWeekOrdinal; i++) {
			date = addWeeks(date, 1);
		}

		result.year = date.getFullYear();
		result.month = date.getMonth();
		result.day = date.getDate();
	}

	return result;
}

module.exports.mapDate = resolveDate;

function resolveTime(r, e, now, result) {
	result = result || new DateValue(e.language);

	let current = currentTime(e);
	let time = current;

	if(r.relative > 0) {
		time = addSeconds(time, r.relative);
	} else {
		if(typeof r.hour !== 'undefined') {
			time = setHours(time, r.hour);
		}

		if(typeof r.minute !== 'undefined') {
			time = setMinutes(time, r.minute);
		} else {
			time = setMinutes(time, 0);
		}

		if(typeof r.second !== 'undefined') {
			time = setSeconds(time, r.second);
		} else {
			time = setSeconds(time, 0);
		}
	}

	if(r.meridiem === 'auto') {
		// This is a 12-hour time, so we might want to switch the hours around
		if(isSameDay(now || time, current) && time.getHours() < current.getHours()) {
			// Same day and hour is before the current hour so assume night time
			time = addHours(time, 12);
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
