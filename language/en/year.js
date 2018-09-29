'use strict';

const Parser = require('../../parser');
const utils = require('../dates');

module.exports = function(language) {
	const integer = language.integer;
	return new Parser(language)
		.name('year')

		.add([ /^[0-9]{4}$/ ], v => { return { year: parseInt(v[0]), yearType: 'numeric' }})
		.add('this year', (v, e) => { return { year: utils.currentTime(e).getFullYear(), yearType: 'text' }})
		.add('next year', (v, e) => { return { year: utils.currentTime(e).getFullYear() + 1, yearType: 'text', }})
		.add('last year', (v, e) => { return { year: utils.currentTime(e).getFullYear() - 1, yearType: 'text' }})
		.add([ 'in', integer, 'years' ], v => { return { relativeYears: v[0].value, yearType: 'relative' }})

		.add([ 'in', Parser.result() ], v => v[0])
		.add([ 'of', Parser.result() ], v => v[0])

		.mapResults(utils.mapYear)
		.onlyBest();
}
