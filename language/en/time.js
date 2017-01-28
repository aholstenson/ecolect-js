'use strict';

const Parser = require('../../parser');
const cloneDeep = require('lodash.clonedeep');

const addMonths = require('date-fns/add_months');
const setISODay = require('date-fns/set_iso_day');
const getISODay = require('date-fns/get_iso_day');
const addWeeks = require('date-fns/add_weeks');
const addDays = require('date-fns/add_days');

function value(v) {
	if(Array.isArray(v)) {
		if(v[0] === v) return null;

		return value(v[0]);
	} else if(v && v.value) {
		return v.value;
	}

	return v;
}

function hasHour(v) {
	return v && typeof v.hour !== 'undefined';
}

function isHour(v) {
	return v && typeof v.hour !== 'undefined' && typeof v.minute === 'undefined';
}

function isMinute(v) {
	return v && typeof v.hour === 'undefined' && typeof v.minute !== 'undefined';
}

function isTime(v) {
	return v;
}

function time(hour, minute) {
	hour = value(hour);
	minute = value(minute);

	if(hour < 0 || hour > 24) return null;
	if(minute < 0 || minute > 60) return null;

	return {
		hour: hour,
		minute: minute
	};
}

function adjustMinutes(time, minutes) {
	if(time.minutes) {

	}
}

function currentTime(encounter) {
	if(encounter.options.now) {
		return encounter.options.now;
	} else {
		return encounter.options.now = new Date();
	}
}

function combine(a, b) {
	const result = cloneDeep(a);
	Object.keys(b).forEach(key => result[key] = b[key]);
	return result;
}

function toDate(date, now) {
	return new Date(
		typeof date.year !== 'undefined' ? date.year : now.getFullYear(),
		typeof date.month !== 'undefined' ? date.month : now.getMonth(),
		typeof date.day !== 'undefined' ? date.day : now.getDate()
	);
}

module.exports = function(language) {
	const integer = language.integer;

	const relativeMinutes = new Parser(language)
		.add([ Parser.result(integer, v => v.value >= 1 && v.value <= 3), 'quarters' ], v => v[0].value * 15)
		.add('quarter', 15)
		.add('half', 30)
		.add(integer, v => v[0].value)
		.add([ integer, 'minutes' ], v => v[0].value);

	return new Parser(language)
		.name('time')

		.skipPunctuation()

		// Named times
		.map(
			{
				midnight: { hour: 0 },
				noon: { hour: 12 }
			},
			v => v
		)

		// HH, such as 4, 14
		.add(/^[0-9]{1,2}$/, v => time(parseInt(v[0])))

		// HH:MM, such as 00:10, 9:30, 14 00
		.add([ /^[0-9]{1,2}$/, /^[0-9]{1,2}$/ ], v => {
			return time(parseInt(v[0]), parseInt(v[1]));
		})

		// HH:MM:SS
		.add([ /^[0-9]{1,2}$/, /^[0-9]{1,2}$/, /^[0-9]{1,2}$/ ], v => {
			return time(parseInt(v[0]), parseInt(v[1]));
		})

		.add([ Parser.result(hasHour), 'pm' ])
		.add([ Parser.result(hasHour), 'p.m.' ])
		.add([ Parser.result(hasHour), 'am' ])
		.add([ Parser.result(hasHour), 'a.m.' ])


		.add([ relativeMinutes, 'to', Parser.result(isHour) ], v => adjustMinutes(v[1], - v[1]))

		// Relative times
		.add([ integer, 'hours' ], (v, e) => time(currentTime(e).getHours() + v[0].value, currentTime(e).getMinutes()))
		.add([ integer, 'minutes' ], (v, e) => { return { minute: currentTime(e).getMinutes() + v[0].value }})
		.add([ integer, 'seconds' ], (v, e) => { return { minute: currentTime(e).getMinutes() + v[0].value }})

		.add([ Parser.result(hasHour), Parser.result(isMinute) ], v => combine(v[0], v[1]))
		.add([ Parser.result(hasHour), 'and', Parser.result(isMinute) ], v => combine(v[0], v[1]))

		// Qualifiers
		.add([ 'in', Parser.result(isTime) ], v => v[0])
		.add([ 'at', Parser.result(hasHour) ], v => v[0])

		// Approximate times
		.add([ Parser.result(isTime), 'ish' ], v => combine(v[0], { precision: 'approximate' }))
		.add([ Parser.result(isTime), 'approximately' ], v => combine(v[0], { precision: 'approximate' }))
		.add([ 'about', Parser.result(isTime) ], v => combine(v[0], { precision: 'approximate' }))
		.add([ 'around', Parser.result(isTime) ], v => combine(v[0], { precision: 'approximate' }))
		.add([ 'approximately', Parser.result(isTime) ], v => combine(v[0], { precision: 'approximate' }))

		// Exact times
		.add([ 'exactly', Parser.result(isTime) ], v => combine(v[0], { precision: 'exact' }))
		.add([ Parser.result(isTime), 'exactly' ], v => combine(v[0], { precision: 'exact' }))
		.add([ Parser.result(isTime), 'sharp' ], v => combine(v[0], { precision: 'exact' }))


		.mapResults((r, e) => {
			const result = {};
			if(typeof r.hour !== 'undefined') {
				result.hour = r.hour;
			} else {
				result.hour = currentTime(e).getHours();
			}
			if(typeof r.minute !== 'undefined') {
				result.minute = r.minute;
			}
			result.precision = r.precision || 'normal';

			return result;
		})
		.onlyBest();
}
