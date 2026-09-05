import { GraphBuilder } from '../../graph/index.js';
import {
	NumberData,
	combineNumbers,
	digitNumber,
	float,
	isNegative,
	negative
} from '../../type-numbers/index.js';
import { LanguageGraphFactory } from '../index.js';

import { integerGraph } from './integerGraph.js';

function isNumber(o: NumberData) {
	return typeof o.value !== 'undefined';
}

export const numberGraph: LanguageGraphFactory<NumberData> = {
	id: 'number',

	create(language) {
		const integer = language.graph(integerGraph);
		return new GraphBuilder<NumberData>(language)
			.name('number')

			.add(integer, v => v[0])

			.add([ GraphBuilder.result(isNumber), integer ], v => combineNumbers(v[0], v[1]))

			// Swedish writes the fraction after a comma, as in 1,5
			.add([ integer, ',', GraphBuilder.result(integer, v => ! v.suffix && ! isNegative(v)) ], v => float(v[0], v[1]))

			.add([ GraphBuilder.result(isNumber), 'e', /^[0-9]$/ ], v => combineNumbers(v[0], digitNumber(
				Math.pow(10, parseInt(v[1], 10)),
				'e' + v[1],
				true
			)))
			.add([ GraphBuilder.result(isNumber), 'e', '-', /^[0-9]$/ ], v => combineNumbers(v[0], digitNumber(
				Math.pow(10, -parseInt(v[1], 10)),
				'e-' + v[1],
				true
			)))

			.add([ '-', GraphBuilder.result(isNumber) ], v => negative(v[0]))
			.add([ 'minus', GraphBuilder.result(isNumber) ], v => negative(v[0]))
			.add([ 'negativ', GraphBuilder.result(isNumber) ], v => negative(v[0]))
			.add([ 'negativt', GraphBuilder.result(isNumber) ], v => negative(v[0]))

			.build();
	}
};
