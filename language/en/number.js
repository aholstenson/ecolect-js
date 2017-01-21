'use strict';

const Parser = require('../../parser');

function combine(a, b) {
	if(b.suffix) {
		const value = a.value * b.value;
		return {
			value: value,
			raw: value,
			integer: a.integer && b.integer
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
		raw: raw
	};
}

function integer(o) {
	return !! o.integer;
}

function number(o) {
	return typeof o.value !== 'undefined';
}

module.exports = function(language) {
	return new Parser(language)

		.add(/[0-9]+/, v => {
			const raw = v[v.length - 1];
			return { value: parseInt(raw), raw: raw, integer: true };
		})

		.add([ integer, '.', integer ], v => float(v[0], v[1]))

		.add([ number, integer ], v => combine(v[v.length - 2], v[v.length - 1]))

		.map(
			{
				'zero': 0,
				'none': 0,
				'nought': 0,
				'nil': 0,
				'one': 1,
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
				'twelve': 12
			},
			l => { return { value: l, raw: l, integer: true } }
		)

		.map(
			{
				'dozen': 12,

				'hundred': 100,
				'thousands': 1000,
				'millions': 1000000,
				'billions': 1000000000,

				'K': 1000,
				'M': 1000000
			},
			l => { return { value: l, raw: l, integer: true, suffix: true }}
		)

		.finalizer(r => {
			r = r.map(m => {
				delete m.integer;
				delete m.suffix;
				delete m.raw;

				return m;
			});
			r.sort((a, b) => a.value - b.value);
			return r;
		});
}
