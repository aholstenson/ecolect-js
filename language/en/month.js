'use strict';

const Parser = require('../../parser');

const { reverse } = require('../../time/matching');
const { map, thisMonth, nextMonth, previousMonth } = require('../../time/months');

module.exports = function(language) {
	const integer = language.integer;
	const ordinal = language.ordinal;
	const ordinalMonth = Parser.result(ordinal, v => v.type === 'specific' && v.value >= 1 && v.value <= 12);

	const relative = new Parser(language)
		.name('relativeMonths')

		.add([ integer, 'months' ], v => { return { relativeMonths: v[0].value }});

	return new Parser(language)
		.name('month')

		.skipPunctuation()

		// Named months
		.map(
			{
				'jan': 0,
				'january': 0,

				'feb': 1,
				'february': 1,

				'mar': 2,
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
		.add('this month', thisMonth)
		.add('previous month', previousMonth)
		.add('last month', previousMonth)
		.add('next month', nextMonth)

		.add([ relative ], v => v[0])

		// Numbered months
		.add([ ordinalMonth, 'month' ], v => ({ month: v[0].value - 1 }))
		.add([ ordinalMonth ], v => ({ month: v[0].value - 1, }))

		.add([ 'in', Parser.result() ], v => v[0])
		.add([ relative, 'ago' ], reverse)

		.mapResults(map)
		.onlyBest();
}
