'use strict';

const GraphBuilder = require('../../graph/builder');

const utils = require('../numbers');

function number(o) {
	return typeof o.value !== 'undefined';
}

module.exports = function(language) {
	const integer = language.integer;
	return new GraphBuilder(language)
		.name('number')

		.add(integer, v => v[0])

		.add([ GraphBuilder.result(number), integer ], v => utils.combine(v[0], v[1]))
		.add([ integer, '.', GraphBuilder.result(integer, v => ! v.suffix && ! v.suffixed) ], v => utils.float(v[0], v[1]))

		.add([ GraphBuilder.result(number), 'e', /^[0-9]$/], v => utils.combine(v[0], {
			value: Math.pow(10, parseInt(v[1])),
			suffix: true
		}))
		.add([ GraphBuilder.result(number), 'e', '-', /^[0-9]$/], v => utils.combine(v[0], {
			value: Math.pow(10, -parseInt(v[1])),
			suffix: true
		}))

		.add([ '-', GraphBuilder.result(number) ], v => utils.negative(v[0]))
		.add([ 'minus', GraphBuilder.result(number) ], v => utils.negative(v[0]))
		.add([ 'negative', GraphBuilder.result(number) ], v => utils.negative(v[0]))

		.mapResults(utils.map)
		.onlyBest()
		.toMatcher();
};
