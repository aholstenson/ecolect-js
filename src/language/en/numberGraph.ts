import { GraphBuilder } from '../../graph/GraphBuilder';
import { LanguageGraphFactory } from '../LanguageGraphFactory';

import { Language } from '../Language';

import { float, combine, negative, digitNumber, isNegative } from '../../numbers/numbers';
import { NumberData } from '../../numbers/NumberData';

import { integerGraph } from './integerGraph';

function isNumber(o: NumberData) {
	return typeof o.value !== 'undefined';
}

export const numberGraph: LanguageGraphFactory<NumberData> = {
	id: 'number',

	create(language: Language) {
		const integer = language.graph(integerGraph);
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

			.build();
	}
};
