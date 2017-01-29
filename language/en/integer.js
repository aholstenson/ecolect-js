'use strict';

const Parser = require('../../parser');
const utils = require('../numbers');

function isDigits(o) {
	return ! o.literal;
}

function isDigitsCompatible(o) {
	return o.suffix || ! o.literal;
}

function isLiteral(o) {
	return o.literal;
}

module.exports = function(language) {
	return new Parser(language)
		.name('integer')

		.add(/^[0-9]+$/, v => {
			const raw = v[0];
			return { value: parseInt(raw), raw: raw };
		})

		.map(
			{
				'zero': 0,
				'none': 0,
				'nought': 0,
				'nil': 0,
				'zilch': 0,
				'one': 1,
				'single': 1,
				'two': 2,
				'three': 3,
				'four': 4,
				'five': 5,
				'six': 6,
				'seven': 7,
				'eight': 8,
				'nine': 9,
				'ten': 10,
				'eleven': 11,
				'twelve': 12,
				'thirteen': 13,
				'fourteen': 14,
				'fifteen': 15,
				'sixteen': 16,
				'seventeen': 17,
				'eighteen': 18,
				'nineteen': 19
			},
			l => { return { value: l, raw: l, literal: true } }
		)

		.map(
			{
				'dozen': 12,

				'hundred': 100,
				'thousand': 1000,
				'million': 1000000,
				'billion': 1000000000,

				'K': 1000,
				'M': 1000000
			},
			l => { return { value: l, raw: l, suffix: true, literal: true }}
		)

		// Digits + digits or digits + suffix, combines 1 000 and 1 thousand but not one 000
		.add([ Parser.result(isDigits), Parser.result(isDigitsCompatible) ], v => utils.combine(v[0], v[1]))

		// Literal + literal - to avoid combining things as `one 000`
		.add([ Parser.result(isLiteral), Parser.result(isLiteral) ], v => utils.combine(v[0], v[1]))

		// Thousands separator
		.add([ Parser.result(isDigits), ',', Parser.result(isDigits) ], v => utils.combine(v[0], v[1]))

		.mapResults(utils.map)
		.onlyBest();
}
