'use strict';

const Parser = require('../../parser');
const { combine } = require('../../time/matching');
const { map } = require('../../time/durations');

module.exports = function(language) {
	const integer = language.integer;

	return new Parser(language)
		.name('date-duration')

		.skipPunctuation()

		.add([ integer, 'years' ], v => ({ relativeYears: v[0].value }))
		.add([ integer, 'yrs' ], v => ({ relativeYears: v[0].value }))
		.add([ integer, 'y' ], v => ({ relativeYears: v[0].value }))
		.add([ integer, 'weeks' ], v => ({ relativeWeeks: v[0].value }))
		.add([ integer, 'wks' ], v => ({ relativeWeeks: v[0].value }))
		.add([ integer, 'w' ], v => ({ relativeWeeks: v[0].value }))
		.add([ integer, 'months' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'mths' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'mon' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'm' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'days' ], v => ({ relativeDays: v[0].value }))
		.add([ integer, 'd' ], v => ({ relativeDays: v[0].value }))

		.add([ Parser.result(), Parser.result() ], v => combine(v[0], v[1]))
		.add([ Parser.result(), 'and', Parser.result() ], v => combine(v[0], v[1]))

		.mapResults(map)
		.onlyBest();
};
