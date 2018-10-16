'use strict';

const GraphBuilder = require('../../graph/builder');
const { combine, isRelative } = require('../../time/matching');
const { map } = require('../../time/date-times');

module.exports = function(language) {
	const time = language.time;
	const date = language.date;

	return new GraphBuilder(language)
		.name('date-time')

		.skipPunctuation()

		.add(time, v => v[0])
		.add(date, v => v[0])

		.add([ time, date ], v => combine(v[0], v[1]))
		.add([ time, 'and', date ], v => combine(v[0], v[1]))

		.add([ date, time ], v => combine(v[0], v[1]))
		.add([ date, 'and', time ], v => combine(v[0], v[1]))

		.add(GraphBuilder.result(date, isRelative), (v, e) => v[0])

		.mapResults(map)
		.onlyBest()
		.toMatcher();
};
