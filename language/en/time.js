'use strict';

const Parser = require('../../parser');
const cloneDeep = require('lodash.clonedeep');
const utils = require('../dates');

function hasHour(v) {
	return v && typeof v.hour !== 'undefined';
}

function isHour(v) {
	return v && typeof v.hour !== 'undefined' && typeof v.minute === 'undefined';
}

function adjustMinutes(time, minutes) {
	return utils.combine(time, {
		relativeMinutes: minutes
	});
}

function reverseRelativeTime(v) {
	const result = cloneDeep(v[0]);
	if(result.relativeHours) {
		result.relativeHours = - result.relativeHours;
	}

	if(result.relativeMinutes) {
		result.relativeMinutes = - result.relativeMinutes;
	}

	if(result.relativeSeconds) {
		result.relativeSeconds = - result.relativeSeconds;
	}
	return result;
}

module.exports = function(language) {
	const integer = language.integer;

	const relativeMinutes = new Parser(language)
		.name('relativeMinutes')

		.add([ Parser.result(integer, v => v.value >= 1 && v.value <= 3), 'quarters' ], v => v[0].value * 15)
		.add('quarter', 15)
		.add('half', 30)
		.add(integer, v => v[0].value)
		.add([ integer, 'minutes' ], v => v[0].value);

	const relativeTimes = new Parser(language)
		.name('relativeTime')

		.add([ integer, 'hours' ], v => ({ relativeHours: v[0].value }))
		.add([ integer, 'minutes' ], v => ({ relativeMinutes: v[0].value }))
		.add([ integer, 'seconds' ], v => ({ relativeSeconds: v[0].value }))

		.add([ Parser.result(), Parser.result() ], v => utils.combine(v[0], v[1]))
		.add([ Parser.result(), 'and', Parser.result() ], v => utils.combine(v[0], v[1]));

	return new Parser(language)
		.name('time')

		.skipPunctuation()

		// Approximate times
		.add([ Parser.result(), 'ish' ], v => utils.combine(v[0], { precision: 'approximate' }))
		.add([ Parser.result(), 'approximately' ], v => utils.combine(v[0], { precision: 'approximate' }))
		.add([ 'about', Parser.result() ], v => utils.combine(v[0], { precision: 'approximate' }))
		.add([ 'around', Parser.result() ], v => utils.combine(v[0], { precision: 'approximate' }))
		.add([ 'approximately', Parser.result() ], v => utils.combine(v[0], { precision: 'approximate' }))

		.add([ Parser.result(), 'amish' ], v => utils.combine(utils.toAM(v[0]), { precision: 'approximate' }))
		.add([ Parser.result(), 'pmish' ], v => utils.combine(utils.toPM(v[0]), { precision: 'approximate' }))

		// Exact times
		.add([ 'exactly', Parser.result() ], v => utils.combine(v[0], { precision: 'exact' }))
		.add([ Parser.result(), 'exactly' ], v => utils.combine(v[0], { precision: 'exact' }))
		.add([ Parser.result(), 'sharp' ], v => utils.combine(v[0], { precision: 'exact' }))

		// Named times
		.map(
			{
				'midnight': 0,
				'noon': 12
			},
			v => utils.time24h(v)
		)

		// HH, such as 4, 14
		.add(/^[0-9]{1,2}$/, v => utils.time12h(parseInt(v[0])))
		.add([ integer ], v => utils.time12h(v[0].value))

		// HH:MM, such as 00:10, 9:30, 14 00
		.add([ /^[0-9]{1,2}$/, /^[0-9]{1,2}$/ ], v => {
			return utils.time12h(parseInt(v[0]), parseInt(v[1]));
		})
		.add([ integer, integer ], v => utils.time12h(v[0].value, v[1].value))
		.add(/^[0-9]{3,4}$/, v => {
			const t = v[0];
			const h = t.length == 3 ? t.substring(0, 1) : t.substring(0, 2);
			const m = t.substring(t.length-2);
			return utils.time12h(parseInt(h), parseInt(m));
		})

		// HH:MM:SS
		.add([ /^[0-9]{1,2}$/, /^[0-9]{1,2}$/, /^[0-9]{1,2}$/ ], v => {
			return utils.time12h(parseInt(v[0]), parseInt(v[1]), parseInt(v[2]));
		})

		.add([ Parser.result(hasHour), 'pm' ], v => utils.toPM(v[0]))
		.add([ Parser.result(hasHour), 'p.m.' ], v => utils.toPM(v[0]))
		.add([ Parser.result(hasHour), 'am' ], v => utils.toAM(v[0]))
		.add([ Parser.result(hasHour), 'a.m.' ], v => utils.toAM(v[0]))


		.add([ relativeMinutes, 'to', Parser.result(isHour) ], v => adjustMinutes(v[1], - v[0]))
		.add([ relativeMinutes, 'til', Parser.result(isHour) ], v => adjustMinutes(v[1], - v[0]))
		.add([ relativeMinutes, 'before', Parser.result(isHour) ], v => adjustMinutes(v[1], - v[0]))
		.add([ relativeMinutes, 'of', Parser.result(isHour) ], v => adjustMinutes(v[1], - v[0]))

		.add([ relativeMinutes, 'past', Parser.result(isHour) ], v => adjustMinutes(v[1], v[0]))
		.add([ relativeMinutes, 'after', Parser.result(isHour) ], v => adjustMinutes(v[1], v[0]))
		.add([ 'half', Parser.result(isHour) ], v => adjustMinutes(v[0], 30))

		// Qualifiers
		.add([ 'in', relativeTimes ], v => v[0])
		.add([ relativeTimes ], v => v[0])
		.add([ relativeTimes, 'ago' ], reverseRelativeTime)
		.add([ 'at', Parser.result() ], v => v[0])

		.mapResults(utils.mapTime)
		.onlyBest();
}
