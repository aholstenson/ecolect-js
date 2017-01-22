'use strict';

const Parser = require('../../parser');

module.exports = function(language) {
	return new Parser(language)

		.add(language.number, v => v)
		.add([ language.number, 'st' ], v => v)
		.add([ language.number, 'nd' ], v => v)
		.add([ language.number, 'rd' ], v => v)
		.add([ language.number, 'th' ], v => v)

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

		.onlyBest()
}
