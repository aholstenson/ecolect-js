'use strict';

const Parser = require('../../parser');
const utils = require('../dates');
const addMonths = require('date-fns/add_months');

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

module.exports = function(language) {
	const integer = language.integer;

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
		.add('this month', (v, e) => adjustedMonth(currentTime(e), 0))
		.add('last month', (v, e) => adjustedMonth(currentTime(e), -1))
		.add('next month', (v, e) => adjustedMonth(currentTime(e), +1))
		.add([ 'in', integer, 'months' ], v => { return { relativeMonths: v[0].value }})

		.add([ 'in', Parser.result() ], v => v[0])

		.mapResults(utils.mapMonth)
		.onlyBest();
}
