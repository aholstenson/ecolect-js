'use strict';

const Parser = require('../../parser');
const { map } = require('../../time/years');
const currentTime = require('../../time/currentTime');

module.exports = function(language) {
	const integer = language.integer;
	return new Parser(language)
		.name('year')

		.add([ /^[0-9]{4}$/ ], v => ({ year: parseInt(v[0]) }))
		.add('this year', (v, e) => ({ year: currentTime(e).getFullYear() }))
		.add('next year', (v, e) => ({ year: currentTime(e).getFullYear() + 1 }))
		.add('last year', (v, e) => ({ year: currentTime(e).getFullYear() - 1 }))
		.add('previous year', (v, e) => ({ year: currentTime(e).getFullYear() - 1 }))
		.add([ 'in', integer, 'years' ], v => ({ relativeYears: v[0].value }))

		.add([ 'in', Parser.result() ], v => v[0])
		.add([ 'of', Parser.result() ], v => v[0])

		.mapResults(map)
		.onlyBest();
}
