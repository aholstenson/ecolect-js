'use strict';

const cloneDeep = require('lodash.clonedeep');

const addMonths = require('date-fns/add_months')
const addWeeks = require('date-fns/add_weeks');
const addDays = require('date-fns/add_days')
const addSeconds = require('date-fns/add_seconds')

const setISODay = require('date-fns/set_iso_day');
const getISODay = require('date-fns/get_iso_day');
const setHours = require('date-fns/set_hours')
const setMinutes = require('date-fns/set_minutes')
const setSeconds = require('date-fns/set_seconds')

module.exports.isRelative = function isRelative(v) {
	return v && (v.relativeMonths >= 0 || v.relativeWeeks >= 0 || v.relativeDays >= 0);
};

module.exports.combine = function(a, b) {
	const result = cloneDeep(a);
	Object.keys(b).forEach(key => result[key] = b[key]);
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
		typeof date.day !== 'undefined' ? date.day : now.getDate()
	);
}

module.exports.toDate = toDate;

function mapYear(r, e) {
	const now = module.exports.currentTime(e);
	if(r.adjusters) {
		r.adjusters.forEach(a => a(r, now));
	}

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

	let time = currentTime(e);

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

	result.hour = time.getHours();
	result.minute = time.getMinutes();
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
