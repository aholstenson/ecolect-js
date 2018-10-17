import GraphBuilder from '../../graph/builder';

function withUnit(v, unit) {
	return {
		value: v.value,
		unit: unit
	};
}

export default function(language) {
	return new GraphBuilder(language)
		.name('temperature')

		.add(language.number, v => v[0])
		.add([ language.number, 'degrees' ], v => v[0])
		.add([ language.number, 'deg' ], v => v[0])

		.add([ language.number, 'F' ], v => withUnit(v[0], 'fahrenheit'))
		.add([ language.number, 'fahrenheit' ], v => withUnit(v[0], 'fahrenheit'))

		.add([ language.number, 'C' ], v => withUnit(v[0], 'celsius'))
		.add([ language.number, 'celsius' ], v => withUnit(v[0], 'celsius'))

		.add(['degrees', GraphBuilder.result(() => true) ], v => v[0])

		.mapResults((data, encounter) => {
			const mapped = {
				value: data.value,
				unit: data.unit || encounter.options.temperature || 'unknown'
			};
			return mapped;
		})

		.onlyBest()
		.toMatcher();
}
