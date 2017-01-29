'use strict';

const Parser = require('../../parser');

module.exports = function(language) {
	return new Parser(language)

		.add(language.integer, v => v[0])
		.add([ language.integer, 'st' ], v => v[0])
		.add([ language.integer, 'nd' ], v => v[0])
		.add([ language.integer, 'rd' ], v => v[0])
		.add([ language.integer, 'th' ], v => v[0])

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
			l => { return { value: l } }
		)

		.add([ 'the', Parser.result() ], v => v[0])

		.onlyBest()
		.mapResults(r => {
			const mapped = {
				value: r.value
			};
			return mapped;
		});
}
