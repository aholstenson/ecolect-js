'use strict';

const Parser = require('../../parser');

const { reverse } = require('../../time/matching');
const { map, thisYear, nextYear, previousYear } = require('../../time/years');

module.exports = function(language) {
	const integer = language.integer;

	const relative = new Parser(language)
		.name('relativeYears')

		.add([ integer, 'years' ], v => ({ relativeYears: v[0].value }));

	return new Parser(language)
		.name('year')

		.add([ /^[0-9]{4}$/ ], v => ({ year: parseInt(v[0]) }))
		.add('this year', thisYear)
		.add('next year', nextYear)
		.add('last year', previousYear)
		.add('previous year', previousYear)

		.add(relative, v => v[0])

		.add([ 'in', Parser.result() ], v => v[0])
		.add([ 'of', Parser.result() ], v => v[0])
		.add([ relative, 'ago' ], reverse)

		.mapResults(map)
		.onlyBest();
};
