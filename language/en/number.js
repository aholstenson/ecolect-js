'use strict';

const Parser = require('../../parser');

function combine(a, b) {
	if(a.suffix && b.suffix) {
		const value = a.value * b.value;
		return {
			value: value,
			raw: value,
			integer: a.integer && b.integer,
			suffix: true
		};
	} else if(b.suffix) {
		const value = a.value * b.value;
		return {
			value: value,
			raw: value,
			integer: a.integer && b.integer,
			suffixed: true
		};
	} else {
		const raw = a.raw + b.raw;
		const value = parseInt(a.raw + b.raw);

		return {
			value: value,
			raw: raw,
			integer: a.integer && b.integer
		};
	}
}

function float(a, b) {
	const raw = a.raw + '.' + b.raw;
	return {
		value: parseFloat(raw),
		raw: raw,
		integer: false
	};
}

function integer(o) {
	return !! o.integer;
}

function number(o) {
	return typeof o.value !== 'undefined';
}

function negative(o) {
	return {
		value: - o.value,
		raw: '-' + o.raw,
		integer: o.integer
	};
}

module.exports = function(language) {
	return new Parser(language)

		.add(/^[0-9]+$/, v => {
			const raw = v[0];
			return { value: parseInt(raw), raw: raw, integer: true };
		})

		.add([ Parser.result(integer), '.', Parser.result(v => v.integer && ! v.suffix && ! v.suffixed) ], v => float(v[0], v[1]))

		.add([ Parser.result(number), Parser.result(integer) ], v => combine(v[0], v[1]))

		.add([ '-', Parser.result(number) ], v => negative(v[0]))
		.add([ 'minus', Parser.result(number) ], v => negative(v[0]))
		.add([ 'negative', Parser.result(number) ], v => negative(v[0]))

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
			l => { return { value: l, raw: l, integer: true } }
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
			l => { return { value: l, raw: l, integer: true, suffix: true }}
		)

		.onlyBest()
		.finalizer(r => {
			const mapped = {
				value: r.value
			};
			return mapped;
		});
}
