'use strict';

const Parser = require('../../parser');

function withUnit(v, unit) {
	return {
		value: v.value,
		unit: unit
	};
}

module.exports = function(language) {
	return new Parser(language)

		.add(language.number, v => v[0])
		.add([ language.number, 'degrees' ], v => v[0])
		.add([ language.number, 'deg' ], v => v[0])

		.add([ language.number, 'F' ], v => withUnit(v[0], 'fahrenheit'))
		.add([ language.number, 'fahrenheit' ], v => withUnit(v[0], 'fahrenheit'))

		.add([ language.number, 'C' ], v => withUnit(v[0], 'celsius'))
		.add([ language.number, 'celsius' ], v => withUnit(v[0], 'celsius'))

		.add(['degrees', Parser.result(() => true) ], v => v[0])

		.mapResults((data, encounter) => {
			const mapped = {
				value: data.value,
				unit: data.unit || encounter.options.temperature || 'unknown'
			};
			return mapped;
		})

		.onlyBest()
}
