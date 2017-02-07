'use strict';

const Parser = require('../../parser');
const utils = require('../dates');

const cloneDeep = require('lodash.clonedeep');

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

function hasMonth(v) {
	if(typeof v.month === 'undefined') return false;

	if(typeof v.year !== 'undefined' && typeof v.day !== 'undefined') return false;

	return true;
}

function withDay(date, day) {
	const result = cloneDeep(date);
	result.day = value(day);
	return result;
}

function withYear(date, year) {
	const result = cloneDeep(date);
	result.year = year.year > 0 ? year.year : value(year);
	return result;
}

function currentTime(encounter) {
	if(encounter.options.now) {
		return encounter.options.now;
	} else {
		return encounter.options.now = new Date();
	}
}

function adjustedDays(date, diff) {
	date = addDays(date, diff);
	return {
		year: date.getFullYear(),
		month: date.getMonth(),
		day: date.getDate()
	};
}

function nextDayOfWeek(v, e) {
	let date = currentTime(e);

	// TODO: Would this change if start of week is on Sunday?
	const dayOfWeek = v[0].value;
	const currentDayOfWeek = getISODay(date);
	if(currentDayOfWeek >= dayOfWeek) {
		date = addWeeks(date, 1);
	}
	date = setISODay(date, dayOfWeek);
	return {
		year: date.getFullYear(),
		month: date.getMonth(),
		day: date.getDate()
	};
}

module.exports = function(language) {
	const ordinal = language.ordinal;
	const integer = language.integer;
	const dayOfWeek = language.dayOfWeek;
	const month = language.month;
	const year = language.year;

	return new Parser(language)
		.name('date')

		.skipPunctuation()

		// This Sunday, Next Monday or On Tuesday
		.add([ 'this', dayOfWeek ], nextDayOfWeek)
		.add([ 'next', dayOfWeek ], nextDayOfWeek)
		.add([ 'on', dayOfWeek ], nextDayOfWeek)

		// Expressions for describing the day, such as today and tomorrow
		.add('today', (v, e) => adjustedDays(currentTime(e), 0))
		.add('tomorrow', (v, e) => adjustedDays(currentTime(e), 1))
		.add('day after tomorrow', (v, e) => adjustedDays(currentTime(e), 2))
		.add('the day after tomorrow', (v, e) => adjustedDays(currentTime(e), 2))
		.add('yesterday', (v, e) => adjustedDays(currentTime(e), -1))

		// Month followed by day - Jan 12, February 1st
		.add([ month, Parser.result(ordinal, v => v.value >= 0 && v.value < 31) ], v => withDay(v[0], v[1]))

		// Day followed by month - 12 Jan, 1st February
		.add([ ordinal, month ], v => withDay(v[1], v[0]))
		.add([ ordinal, 'of', month ], v => withDay(v[1], v[0]))

		// Non-year (month and day) followed by year
		// With day: 12 Jan 2018, 1st February 2018
		// Without day: Jan 2018, this month 2018
		.add([ Parser.result(hasMonth), year ], v => utils.combine(v[0], v[1]))

		.add([ month, /^[0-9]{1,2}$/ ], v => withYear(v[0], v[1]))
		.add([ month, 'in', /^[0-9]{1,2}$/ ], v => withYear(v[0], v[1]))
		.add([ month, 'of', /^[0-9]{1,2}$/ ], v => withYear(v[0], v[1]))

		// Year - Month - Day, such as 2017-01-24 or 2017 2 5
		.add([ /^[0-9]{4}$/, /^[0-9]{1,2}$/, /^[0-9]{1,2}$/ ], v => {
			return {
				year: parseInt(v[0]),
				month: parseInt(v[1]) - 1,
				day: parseInt(v[2])
			};
		})

		// Month / Day / Year
		.add([ /^[0-9]{1,2}$/, /^[0-9]{1,2}$/,  /^[0-9]{4}$/ ], v => {
			return {
				year: parseInt(v[2]),
				month: parseInt(v[0]) - 1,
				day: parseInt(v[1])
			};
		})

		// Month / Day
		.add([ /^[0-9]{1,2}$/, /^[0-9]{1,2}$/ ], v => {
			return {
				month: parseInt(v[0]) - 1,
				day: parseInt(v[1])
			};
		})

		// Relative dates
		.add([ integer, 'days' ], v => { return { relativeDays: v[0].value }})
		.add([ integer, 'months' ], v => { return { relativeMonths: v[0].value }})
		.add([ integer, 'weeks' ], v => { return { relativeDays: v[0].value * 7 }})

		.add([ Parser.result(utils.isRelative), Parser.result(utils.isRelative) ], v => utils.combine(v[0], v[1]))
		.add([ Parser.result(utils.isRelative), 'and', Parser.result(utils.isRelative) ], v => utils.combine(v[0], v[1]))

		// nth day of week in month
		.add([ ordinal, dayOfWeek, month ], v => utils.combine(v[2], {
			dayOfWeek: v[1].value,
			dayOfWeekOrdinal: v[0].value
		}))

		// nth day of week in year
		.add([ ordinal, dayOfWeek, year ], v => utils.combine(v[2], {
			dayOfWeek: v[1].value,
			dayOfWeekOrdinal: v[0].value
		}))

		.add([ ordinal, dayOfWeek, Parser.result(utils.isRelative) ], v => utils.combine(v[2], {
			dayOfWeek: v[1].value,
			dayOfWeekOrdinal: v[0].value
		}))

		.add([ 'in', Parser.result() ], v => v[0])
		.add([ 'on', Parser.result() ], v => v[0])
		.add([ 'on', 'the', Parser.result() ], v => v[0])

		.mapResults(utils.mapDate)
		.onlyBest();
}
