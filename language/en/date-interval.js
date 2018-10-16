'use strict';

const GraphBuilder = require('../../graph/builder');

const { between } = require('../../time/matching');
const { map } = require('../../time/date-intervals');

function singleFrom(v) {
	return v && v.start && v.end === v.start;
}

module.exports = function(language) {
	const date = language.date;

	return new GraphBuilder(language)
		.name('date-interval')

		.add(date, between)

		// X to Y
		// January to February
		// January 2010 to March 2011
		// 2010-01-01 to 2010-02-05
		// February to 2020
		.add([ GraphBuilder.result(singleFrom), 'to', GraphBuilder.result(singleFrom) ], between)
		.add([ GraphBuilder.result(singleFrom), 'until', GraphBuilder.result(singleFrom) ], between)
		.add([ GraphBuilder.result(singleFrom), '-', GraphBuilder.result(singleFrom) ], between)
		.add([ GraphBuilder.result(singleFrom), 'and', GraphBuilder.result(singleFrom) ], between)

		.add([ 'from', GraphBuilder.result() ])
		.add([ 'between', GraphBuilder.result() ])

		.mapResults(map)

		.onlyBest()
		.toMatcher();
};
