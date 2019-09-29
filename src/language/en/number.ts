import { GraphBuilder } from '../../graph/GraphBuilder';

import { float, combine, negative, map, digitNumber, isNegative } from '../../numbers/numbers';
import { NumberData } from '../../numbers/NumberData';
import { ValueMatcherFactory } from '../ValueMatcherFactory';
import { NumberValue } from '../../numbers/NumberValue';
import { Language } from '../Language';
import { Matcher } from '../../graph/matching';
import { integerMatcher } from './integer';

function isNumber(o: NumberData) {
	return typeof o.value !== 'undefined';
}

export const numberMatcher: ValueMatcherFactory<NumberValue> = {
	id: 'number',

	create(language: Language): Matcher<NumberValue | null> {
		const integer = language.matcher(integerMatcher);
		return new GraphBuilder<NumberData>(language)
			.name('number')

			.add(integer, v => v[0])

			.add([ GraphBuilder.result(isNumber), integer ], v => combine(v[0], v[1]))
			.add([ integer, '.', GraphBuilder.result(integer, v => ! v.suffix && ! isNegative(v)) ], v => float(v[0], v[1]))

			.add([ GraphBuilder.result(isNumber), 'e', /^[0-9]$/], v => combine(v[0], digitNumber(
				Math.pow(10, parseInt(v[1], 10)),
				'e' + v[1],
				true
			)))
			.add([ GraphBuilder.result(isNumber), 'e', '-', /^[0-9]$/], v => combine(v[0], digitNumber(
				Math.pow(10, -parseInt(v[1], 10)),
				'e-' + v[1],
				true
			)))

			.add([ '-', GraphBuilder.result(isNumber) ], v => negative(v[0]))
			.add([ 'minus', GraphBuilder.result(isNumber) ], v => negative(v[0]))
			.add([ 'negative', GraphBuilder.result(isNumber) ], v => negative(v[0]))

			.mapResults(map)
			.onlyBest()
			.toMatcher();
	}
};
