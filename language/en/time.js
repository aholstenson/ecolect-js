'use strict';

const Parser = require('../../parser');
const cloneDeep = require('lodash.clonedeep');

const addSeconds = require('date-fns/add_seconds')
const setHours = require('date-fns/set_hours')
const setMinutes = require('date-fns/set_minutes')
const setSeconds = require('date-fns/set_seconds')

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

function isTime(v) {
	return v;
}

function isRelativeTime(v) {
	return v && v.relative >= 0;
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

function toPM(time) {
	const hour = time.hour;
	if(hour >= 0 && hour < 12) {
		time.hour += 12;
	}
	return time;
}

function toAM(time) {
	const hour = time.hour;
	if(hour >= 12) {
		time.hour -= 12;
	}
	return time;
}

function adjustMinutes(time, minutes) {
	const result = cloneDeep(time);
	result.minute = (result.minute || 0) + minutes;
	return result;
}

function relativeTime(seconds) {
	return {
		relative: seconds
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
	if(a.relative >= 0) {
		result.relative += a.relative;
	}
	return result;
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
				'midnight': { hour: 0 },
				'noon': { hour: 12 }
			},
			v => v
		)

		// HH, such as 4, 14
		.add(/^[0-9]{1,2}$/, v => time(parseInt(v[0])))
		.add([ integer ], v => time(v[0].value))

		// HH:MM, such as 00:10, 9:30, 14 00
		.add([ /^[0-9]{1,2}$/, /^[0-9]{1,2}$/ ], v => {
			return time(parseInt(v[0]), parseInt(v[1]));
		})
		.add([ integer, integer ], v => time(v[0].value, v[1].value))
		.add(/^[0-9]{3,4}$/, v => {
			const t = v[0];
			const h = t.length == 3 ? t.substring(0, 1) : t.substring(0, 2);
			const m = t.substring(t.length-2);
			return time(parseInt(h), parseInt(m));
		})

		// HH:MM:SS
		.add([ /^[0-9]{1,2}$/, /^[0-9]{1,2}$/, /^[0-9]{1,2}$/ ], v => {
			return time(parseInt(v[0]), parseInt(v[1]));
		})

		.add([ Parser.result(hasHour), 'pm' ], v => toPM(v[0]))
		.add([ Parser.result(hasHour), 'p.m.' ], v => toPM(v[0]))
		.add([ Parser.result(hasHour), 'am' ], v => toAM(v[0]))
		.add([ Parser.result(hasHour), 'a.m.' ], v => toAM(v[0]))


		.add([ relativeMinutes, 'to', Parser.result(isHour) ], v => adjustMinutes(v[1], - v[0]))
		.add([ relativeMinutes, 'til', Parser.result(isHour) ], v => adjustMinutes(v[1], - v[0]))
		.add([ relativeMinutes, 'before', Parser.result(isHour) ], v => adjustMinutes(v[1], - v[0]))
		.add([ relativeMinutes, 'of', Parser.result(isHour) ], v => adjustMinutes(v[1], - v[0]))

		.add([ relativeMinutes, 'past', Parser.result(isHour) ], v => adjustMinutes(v[1], v[0]))
		.add([ relativeMinutes, 'after', Parser.result(isHour) ], v => adjustMinutes(v[1], v[0]))
		.add([ 'half', Parser.result(isHour) ], v => adjustMinutes(v[0], 30))

		// Relative times
		.add([ integer, 'hours' ], v => relativeTime(v[0].value * 3600))
		.add([ integer, 'minutes' ], v => relativeTime(v[0].value * 60))
		.add([ integer, 'seconds' ], v => relativeTime(v[0].value))

		.add([ Parser.result(isRelativeTime), Parser.result(isRelativeTime) ], v => combine(v[0], v[1]))
		.add([ Parser.result(isRelativeTime), 'and', Parser.result(isRelativeTime) ], v => combine(v[0], v[1]))
		.add([ 'in', Parser.result(isRelativeTime) ], v => v[0])

		// Qualifiers
		.add([ 'at', Parser.result(isTime) ], v => v[0])


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
			result.precision = r.precision || 'normal';

			return result;
		})
		.onlyBest();
}
