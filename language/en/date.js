'use strict';

const Parser = require('../../parser');
const cloneDeep = require('lodash.clonedeep');

const addMonths = require('date-fns/add_months');
const setISODay = require('date-fns/set_iso_day');
const getISODay = require('date-fns/get_iso_day');
const addWeeks = require('date-fns/add_weeks');

function value(v) {
	if(Array.isArray(v)) {
		if(v[0] === v) return null;

		return value(v[0]);
	} else if(v && v.value) {
		return v.value;
	}

	return v;
}

function isDayOfWeek(v) {
	return typeof v.dayOfWeek !== 'undefined'
		&& typeof v.year === 'undefined'
		&& typeof v.month === 'undefined'
		&& typeof v.day === 'undefined';
}

function isMonth(v) {
	return typeof v.year === 'undefined'
		&& v.month >= 0
		&& typeof v.day === 'undefined'
		&& typeof v.dayOfWeek === 'undefined';
}

function hasMonth(v) {
	if(typeof v.month === 'undefined') return false;

	if(typeof v.year !== 'undefined' && typeof v.day !== 'undefined') return false;

	return true;
}

function isMonthDay(v) {
	return typeof v.year === 'undefined' && v.month >= 0 && v.day >= 0;
}

function isNoYear(v) {
	if(typeof v.year !== 'undefined') return false;

	return typeof v.month !== 'undefined';
}

function isYear(v) {
	return v.year >= 0 && typeof v.day === 'undefined' && typeof v.month === 'undefined';
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

function adjustedMonth(date, diff) {
	date = addMonths(date, diff);
	return {
		year: date.getFullYear(),
		month: date.getMonth()
	};
}

function nextDayOfWeek(v, e) {
	let date = currentTime(e);

	// TODO: Would this change if start of week is on Sunday?
	const dayOfWeek = v[0].dayOfWeek;
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

function withAdjuster(date, adjuster) {
	const result = cloneDeep(date);
	if(! result.adjusters) {
		result.adjusters = [ adjuster ];
	} else {
		result.adjusters.push(adjuster);
	}
	return result;
}

function dayInMonth(now, result, ordinal, day) {
	result.day = 1;
	let date = toDate(result, now);
	const currentDayOfWeek = getISODay(date);
	if(currentDayOfWeek > day) {
		date = addWeeks(date, 1);
	}
	date = setISODay(date, day);

	for(let i=1; i<ordinal; i++) {
		date = addWeeks(date, 1);
	}

	result.year = date.getFullYear();
	result.month = date.getMonth();
	result.day = date.getDate();
}

function dayInYear(now, date, ordinal, day) {
	date.day = 1;
	date.month = 0;
	dayInMonth(now, date, ordinal, day);
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
	const ordinal = language.ordinal;

	return new Parser(language)
		.name('date')

		.skipPunctuation()

		// Day of week
		.map(
			{
				'mon': 1,
				'monday': 1,

				'tue': 2,
				'tuesday': 2,

				'wed': 3,
				'wednesday': 3,

				'thu': 4,
				'thurs': 4,
				'thursday': 4,

				'fri': 5,
				'friday': 5,

				'sat': 6,
				'saturday': 6,

				'sun': 7,
				'sunday': 7
			},
			l => { return { dayOfWeek: l } }
		)

		// This Sunday
		.add([ 'this', Parser.result(isDayOfWeek) ], nextDayOfWeek)
		.add([ 'next', Parser.result(isDayOfWeek) ], nextDayOfWeek)

		// Named months
		.map(
			{
				'jan': 0,
				'january': 0,

				'feb': 1,
				'february': 1,

				'march': 2,

				'apr': 3,
				'april': 3,

				'may': 4,

				'jun': 5,
				'june': 5,

				'jul': 6,
				'july': 6,

				'aug': 7,
				'august': 7,

				'sep': 8,
				'sept': 8,
				'september': 8,

				'oct': 9,
				'october': 9,

				'nov': 10,
				'november': 10,

				'dec': 11,
				'december': 11
			},
			l => { return { month: l } }
		)

		// Dynamic months
		.add('this month', (v, e) => adjustedMonth(currentTime(e), 0))
		.add('last month', (v, e) => adjustedMonth(currentTime(e), -1))
		.add('next month', (v, e) => adjustedMonth(currentTime(e), +1))

		// Years
		.add([ /^[0-9]{4}$/ ], v => { return { year: parseInt(value(v[0])) }})
		.add('this year', (v, e) => { return { year: currentTime(e).getFullYear() }})
		.add('next year', (v, e) => { return { year: currentTime(e).getFullYear() + 1 }})
		.add('last year', (v, e) => { return { year: currentTime(e).getFullYear() - 1 }})
		.add([ 'in', ordinal, 'years' ], (v, e) => { return { year: currentTime(e).getFullYear() + v[0].value }})

		// Month followed by day - Jan 12, February 1st
		.add([ Parser.result(isMonth), Parser.result(ordinal, v => v.value >= 0 && v.value < 31) ], v => withDay(v[0], v[1]))

		// Day followed by month - 12 Jan, 1st February
		.add([ ordinal, Parser.result(isMonth) ], v => withDay(v[1], v[0]))
		.add([ ordinal, 'of', Parser.result(isMonth) ], v => withDay(v[1], v[0]))

		// Non-year (month and day) followed by year
		// With day: 12 Jan 2018, 1st February 2018
		// Without day: Jan 2018, this month 2018
		.add([ Parser.result(hasMonth), Parser.result(isYear) ], v => withYear(v[0], v[1]))
		.add([ Parser.result(hasMonth), 'in', Parser.result(isYear) ], v => withYear(v[0], v[1]))
		.add([ Parser.result(hasMonth), 'of', Parser.result(isYear) ], v => withYear(v[0], v[1]))

		// Year - Month - Day, such as 2017-01-24 or 2017 2 5
		.add([ /^[0-9]{4}$/, /^[0-9]{1,2}$/, /^[0-9]{1,2}$/ ], v => {
			return {
				year: parseInt(v[0]),
				month: parseInt(v[1]) - 1,
				day: parseInt(v[2])
			};
		})

		// nth day of week in month
		.add([ ordinal, Parser.result(isDayOfWeek), Parser.result(isMonth) ], v => {
			const dayOfWeek = v[1].dayOfWeek;
			const ordinal = v[0].value;
			return withAdjuster(v[2], (date, now) => dayInMonth(now, date, ordinal, dayOfWeek))
		})

		// nth day of week in year
		.add([ ordinal, Parser.result(isDayOfWeek), Parser.result(isYear) ], v => {
			const dayOfWeek = v[1].dayOfWeek;
			const ordinal = v[0].value;
			return withAdjuster(v[2], (date, now) => dayInYear(now, date, ordinal, dayOfWeek))
		})


		.add([ 'in', Parser.result() ], v => v[0])
		.add([ 'on', Parser.result() ], v => v[0])
		.add([ 'on', 'the', Parser.result() ], v => v[0])

		.mapResults((r, e) => {
			const now = currentTime(e);
			if(r.adjusters) {
				r.adjusters.forEach(a => a(r, now));
			}

			const result = {};
			if(typeof r.year !== 'undefined') {
				result.year = r.year;
			}
			if(typeof r.month !== 'undefined') {
				result.month = r.month;
			}
			if(typeof r.day !== 'undefined') {
				result.day = r.day;
			}
			if(typeof r.dayOfWeek !== 'undefined') {
				result.dayOfWeek = r.dayOfWeek;
			}

			return result;
		})
		.onlyBest();
}
