'use strict';

const Parser = require('../../parser');

const utils = require('../numbers');

function number(o) {
	return typeof o.value !== 'undefined';
}

module.exports = function(language) {
	const integer = language.integer;
	return new Parser(language)
		.name('number')

		.add(integer, v => v[0])

		.add([ Parser.result(number), integer ], v => utils.combine(v[0], v[1]))
		.add([ integer, '.', Parser.result(integer, v => ! v.suffix && ! v.suffixed) ], v => utils.float(v[0], v[1]))

		.add([ Parser.result(number), 'e', /^[0-9]$/], v => utils.combine(v[0], {
			value: Math.pow(10, parseInt(v[1])),
			suffix: true
		}))
		.add([ Parser.result(number), 'e', '-', /^[0-9]$/], v => utils.combine(v[0], {
			value: Math.pow(10, -parseInt(v[1])),
			suffix: true
		}))

		.add([ '-', Parser.result(number) ], v => utils.negative(v[0]))
		.add([ 'minus', Parser.result(number) ], v => utils.negative(v[0]))
		.add([ 'negative', Parser.result(number) ], v => utils.negative(v[0]))

		.mapResults(utils.map)
		.onlyBest();
}
