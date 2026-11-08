import { GraphBuilder } from '../../graph/index.js';
import type {
	NumberData} from '../../type-numbers/index.js';
import {
	canFollowNumber,
	combineNumbers,
	float,
	isNegative,
	negative,
	powerOfTen
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

			// Swedish writes the fraction after a comma, as in 1,5
			.add([ integer, ',', GraphBuilder.result(integer, v => ! v.suffix && ! isNegative(v)) ], v => float(v[0], v[1]))

			.add([ GraphBuilder.result(isNumber), 'e', /^[0-9]$/ ], v => combineNumbers(v[0], powerOfTen(parseInt(v[1], 10))))
			.add([ GraphBuilder.result(isNumber), 'e', '-', /^[0-9]$/ ], v => combineNumbers(v[0], powerOfTen(-parseInt(v[1], 10))))

			.add([ '-', GraphBuilder.result(isNumber) ], v => negative(v[0]))
			.add([ 'minus', GraphBuilder.result(isNumber) ], v => negative(v[0]))
			.add([ 'negativ', GraphBuilder.result(isNumber) ], v => negative(v[0]))
			.add([ 'negativt', GraphBuilder.result(isNumber) ], v => negative(v[0]))

			.build();
	}
};
