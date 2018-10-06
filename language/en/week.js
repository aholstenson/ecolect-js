'use strict';

const Parser = require('../../parser');

const { map, thisWeek, nextWeek, previousWeek } = require('../../time/weeks');

module.exports = function(language) {
	const ordinal = language.ordinal;

	return new Parser(language)
		.name('week')

		.skipPunctuation()

		// Weeks relative to current time
		.add([ 'this week' ], thisWeek)
		.add([ 'next week' ], nextWeek)
		.add([ 'last week' ], previousWeek)
		.add([ 'previous week' ], previousWeek)

		.add([ 'week', ordinal ], v => ({ week: v[0].value }))
		.add([ ordinal, 'week' ], v => ({ week: v[0].value }))

		.mapResults(map)
		.onlyBest();
};
