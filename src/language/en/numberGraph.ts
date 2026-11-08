import { GraphBuilder } from '../../graph/index.js';
import type {
	NumberData} from '../../type-numbers/index.js';
import {
	canFollowNumber,
	combineNumbers,
	digitNumber,
	float,
	isNegative,
	negative
} from '../../type-numbers/index.js';
import type { LanguageGraphFactory } from '../index.js';

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

			// A negative number is not combined further, so that a minus sign applies to all of the number
			.add([ GraphBuilder.result(v => isNumber(v) && ! isNegative(v)), GraphBuilder.result(integer, canFollowNumber) ], v => combineNumbers(v[0], v[1]))
			.add([ integer, '.', GraphBuilder.result(integer, v => ! v.suffix && ! isNegative(v)) ], v => float(v[0], v[1]))

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
			.add([ 'negative', GraphBuilder.result(isNumber) ], v => negative(v[0]))

			.build();
	}
};
