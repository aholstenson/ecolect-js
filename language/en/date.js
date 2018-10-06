'use strict';

const Parser = require('../../parser');

const {
	combine,
	isRelative,
	startOf,
	endOf,
	isWeek,
	isMonth,
	hasMonth,
	reverse
} = require('../../time/matching');
const { thisWeek } = require('../../time/weeks');
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

function withDay(date, day) {
	return combine(date, {
		day: value(day)
	});
}

function withYear(v) {
	const year = parseInt(value(v[1]));
	return combine(v[0], {
		year: year < 1000 ? year + 2000 : year
	});
}

function nextDayOfWeek(v) {
	return { dayOfWeek: v[0].value };
}

module.exports = function(language) {
	const ordinal = language.ordinal;
	const dayOfWeek = language.dayOfWeek;
	const month = language.month;
	const week = language.week;
	const year = language.year;
	const dateDuration = language.dateDuration;

	const day = Parser.result(ordinal, v => v.value >= 0 && v.value < 31);

	return new Parser(language)
		.name('date')

		.skipPunctuation()

		// Relative
		.add([ dateDuration ], v => v[0])
		.add([ dateDuration, 'after', Parser.result() ], v => combine(v[0], {
			relativeTo: v[1]
		}))
		.add([ dateDuration, 'from', Parser.result() ], v => combine(v[0], {
			relativeTo: v[1]
		}))
		.add([ dateDuration, 'before', Parser.result() ], v => combine(reverse(v[0]), {
			relativeTo: v[1]
		}))

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
		.add([ day ], v => ({ day: v[0].value }))

		// Day followed by month - 12 Jan, 1st February
		.add([ day, month ], v => withDay(v[1], v[0]))
		.add([ day, 'of', month ], v => withDay(v[1], v[0]))

		// Month
		.add([ month ], v => v[0])
		.add([ 'last month', year ], v => combine(v[0], { month: 11 }))
		.add([ 'first month', year ], v => combine(v[0], { month: 0 }))

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

		// Standalone year
		.add([ year ], v => v[0])

		// Weeks relative to current time
		.add(week, v => v[0])
		.add('start of week', thisWeek)
		.add('end of week', (v, e) => combine(thisWeek(v, e), { intervalEdge: 'end' }))

		// Week N of year
		.add([ week, year ], v => combine(v[1], {
			week: v[0].week
		}))

		.add([ year, week ], v => combine(v[0], {
			week: v[1].week
		}))

		// nth day of week in month
		.add([ ordinal, dayOfWeek, Parser.result(isMonth) ], v => combine(v[2], {
			dayOfWeek: v[1].value,
			dayOfWeekOrdinal: v[0].value
		}))

		// first day of week in month
		.add([ dayOfWeek, Parser.result(isMonth) ], v => combine(v[1], {
			dayOfWeek: v[0].value,
			dayOfWeekOrdinal: 1
		}))

		// nth day of week in year
		.add([ ordinal, dayOfWeek, year ], v => combine(v[2], {
			dayOfWeek: v[1].value,
			dayOfWeekOrdinal: v[0].value
		}))

		// first day of week in year
		.add([ dayOfWeek, year ], v => combine(v[1], {
			dayOfWeek: v[0].value,
			dayOfWeekOrdinal: 1
		}))

		// nth day of week in X time
		.add([ ordinal, dayOfWeek, Parser.result(isRelative) ], v => combine(v[2], {
			dayOfWeek: v[1].value,
			dayOfWeekOrdinal: v[0].value
		}))

		// first day of week in X time
		.add([ dayOfWeek, Parser.result(isRelative) ], v => combine(v[1], {
			dayOfWeek: v[0].value,
			dayOfWeekOrdinal: 1
		}))

		// day of week in week X
		.add([ dayOfWeek, Parser.result(isWeek) ], v => combine(v[1], {
			dayOfWeek: v[0].value,
			dayOfWeekOrdinal: 1
		}))

		.add([ Parser.result(isWeek), dayOfWeek ], v => combine(v[0], {
			dayOfWeek: v[1].value,
			dayOfWeekOrdinal: 1
		}))

		// Extra qualifiers such as in and on
		.add([ 'in', Parser.result(isRelative) ], v => v[0])
		.add([ 'on', Parser.result() ], v => v[0])
		.add([ 'on', 'the', Parser.result() ], v => v[0])
		.add([ dateDuration, 'ago' ], reverse)

		// Edges, such as start of [date] or end of [date]
		.add([ 'start of', Parser.result() ], startOf)
		.add([ 'beginning of', Parser.result() ], startOf)
		.add([ 'end of', Parser.result() ], endOf)

		.mapResults(map)
		.onlyBest();
};
