'use strict';

const Parser = require('../../parser');

const { between } = require('../../time/matching');
const { map } = require('../../time/date-intervals');

function singleFrom(v) {
	return v && v.start && ! v.end;
}

module.exports = function(language) {
	const date = language.date;

	return new Parser(language)

		.add(date, between)

		// X to Y
		// January to February
		// January 2010 to March 2011
		// 2010-01-01 to 2010-02-05
		// February to 2020
		.add([ Parser.result(singleFrom), 'to', Parser.result(singleFrom) ], between)
		.add([ Parser.result(singleFrom), 'until', Parser.result(singleFrom) ], between)
		.add([ Parser.result(singleFrom), '-', Parser.result(singleFrom) ], between)
		.add([ Parser.result(singleFrom), 'and', Parser.result(singleFrom) ], between)

		.add([ 'from', Parser.result() ])
		.add([ 'between', Parser.result() ])

		.mapResults(map)

		.onlyBest()
}
