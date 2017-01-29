'use strict';

const Parser = require('../../parser');
const utils = require('../dates');

module.exports = function(language) {
	const integer = language.integer;
	return new Parser(language)
		.name('year')

		.add([ /^[0-9]{4}$/ ], v => { return { year: parseInt(v[0]) }})
		.add('this year', (v, e) => { return { year: utils.currentTime(e).getFullYear() }})
		.add('next year', (v, e) => { return { year: utils.currentTime(e).getFullYear() + 1 }})
		.add('last year', (v, e) => { return { year: utils.currentTime(e).getFullYear() - 1 }})
		.add([ 'in', integer, 'years' ], v => { return { relativeYear: v[0].value }})

		.add([ 'in', Parser.result() ], v => v[0])
		.add([ 'of', Parser.result() ], v => v[0])

		.mapResults(utils.mapYear)
		.onlyBest();
}
