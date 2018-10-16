'use strict';

const GraphBuilder = require('../../graph/builder');

const specific = v => ({ value: v[0].value, type: 'specific' });

module.exports = function(language) {
	return new GraphBuilder(language)
		.name('ordinal')

		.add(language.integer, v => ({ value: v[0].value, type: 'ambigious' }))
		.add([ language.integer, 'st' ], specific)
		.add([ language.integer, 'nd' ], specific)
		.add([ language.integer, 'rd' ], specific)
		.add([ language.integer, 'th' ], specific)

		.map(
			{
				'first': 1,
				'second': 2,
				'third': 3,
				'fourth': 4,
				'fifth': 5,
				'sixth': 6,
				'seventh': 7,
				'eight': 8,
				'ninth': 9,
				'tenth': 10
			},
			l => ({ value: l, type: 'specific' })
		)

		.add([ 'the', GraphBuilder.result() ], v => v[0])

		.onlyBest()
		.mapResults(r => {
			const mapped = {
				value: r.value
			};
			return mapped;
		})
		.toMatcher();
};
