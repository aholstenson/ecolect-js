'use strict';

const Parser = require('../../parser');

const { combine, isRelative, startOf, endOf } = require('../../time/matching');
const { map } = require('../../time/dates');

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
	return combine(date, {
		day: value(day)
	});
}

function withYear(v) {
	return combine(v[0], {
		year: value(v[1])
	});
}

function nextDayOfWeek(v) {
	return { dayOfWeek: v[0].value };
}

module.exports = function(language) {
	const ordinal = language.ordinal;
	const integer = language.integer;
	const dayOfWeek = language.dayOfWeek;
	const month = language.month;
	const year = language.year;

	const day = Parser.result(ordinal, v => v.value >= 0 && v.value < 31);

	return new Parser(language)
		.name('date')

		.skipPunctuation()

		// This Sunday, Next Monday or On Tuesday
		.add(dayOfWeek, nextDayOfWeek)
		.add([ 'this', dayOfWeek ], nextDayOfWeek)
		.add([ 'next', dayOfWeek ], nextDayOfWeek)
		.add([ 'on', dayOfWeek ], nextDayOfWeek)

		// Expressions for describing the day, such as today and tomorrow
		.add('today', () => ({ relativeDays: 0 }))
		.add('tomorrow', () => ({ relativeDays: 1 }))
		.add('day after tomorrow', () => ({ relativeDays: 2 }))
		.add('the day after tomorrow', () => ({ relativeDays: 2 }))
		.add('yesterday', () => ({ relativeDays: -1 }))

		// Month followed by day - Jan 12, February 1st
		.add([ month, day ], v => withDay(v[0], v[1]))

		// Just the day
		.add([ day ], v => { return { day: v[0].value } })

		// Day followed by month - 12 Jan, 1st February
		.add([ day, month ], v => withDay(v[1], v[0]))
		.add([ day, 'of', month ], v => withDay(v[1], v[0]))

		// Non-year (month and day) followed by year
		// With day: 12 Jan 2018, 1st February 2018
		// Without day: Jan 2018, this month 2018
		.add([ Parser.result(hasMonth), year ], v => combine(v[0], v[1]))

		.add([ month, 'in', /^[0-9]{1,2}$/ ], withYear)
		.add([ month, 'of', /^[0-9]{1,2}$/ ], withYear)

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

		// Month
		.add([ month ], v => v[0])

		// Relative dates
		.add([ integer, 'days' ], v => { return { relativeDays: v[0].value }})
		.add([ integer, 'months' ], v => { return { relativeMonths: v[0].value }})
		.add([ integer, 'weeks' ], v => { return { relativeWeeks: v[0].value }})
		.add([ year ], v => v[0])

		.add([ 'this week' ], () => ({ relativeWeeks: 0, intervalEdge: 'start' }))
		.add([ 'week', ordinal ], v => ({ week: v[0].value }))
		.add('start of week', () => ({ relativeWeeks: 0, intervalEdge: 'start' }))
		.add('end of week', () => ({ relativeWeeks: 0, intervalEdge: 'end' }))

		.add([ Parser.result(isRelative), Parser.result(isRelative) ], v => combine(v[0], v[1]))
		.add([ Parser.result(isRelative), 'and', Parser.result(isRelative) ], v => combine(v[0], v[1]))

		// nth day of week in month
		.add([ ordinal, dayOfWeek, month ], v => combine(v[2], {
			dayOfWeek: v[1].value,
			dayOfWeekOrdinal: v[0].value
		}))

		// nth day of week in year
		.add([ ordinal, dayOfWeek, year ], v => combine(v[2], {
			dayOfWeek: v[1].value,
			dayOfWeekOrdinal: v[0].value
		}))

		.add([ ordinal, dayOfWeek, Parser.result(isRelative) ], v => combine(v[2], {
			dayOfWeek: v[1].value,
			dayOfWeekOrdinal: v[0].value
		}))

		// Week N of year
		.add([ 'week', ordinal, year ], v => combine(v[1], {
			week: v[0].value
		}))

		.add([ ordinal, 'week', year ], v => combine(v[1], {
			week: v[0].value
		}))

		.add([ 'in', Parser.result() ], v => v[0])
		.add([ 'on', Parser.result() ], v => v[0])
		.add([ 'on', 'the', Parser.result() ], v => v[0])

		// Edges, such as start of [date] or end of [date]
		.add([ 'start of', Parser.result() ], startOf)
		.add([ 'beginning of', Parser.result() ], startOf)
		.add([ 'end of', Parser.result() ], endOf)

		.mapResults(map)
		.onlyBest();
}
