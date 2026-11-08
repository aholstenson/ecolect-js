import { GraphBuilder } from '../../graph/index.js';
import type {
	NumberData} from '../../type-numbers/index.js';
import {

	literalNumber,
	digitNumber,

	canFollowNumber,
	combineNumbers,
	hasScaleWord,

	isDigits,
	isDigitsCompatible,
	isLiteral,
} from '../../type-numbers/index.js';
import type { LanguageGraphFactory } from '../index.js';

import { CARDINAL_WORDS, MULTIPLIER_WORDS } from './numberWords.js';

export const integerGraph: LanguageGraphFactory<NumberData> = {
	id: 'integer',

	create(language) {
		return new GraphBuilder<NumberData>(language)
			.name('integer')

			.add(/^[0-9]+$/, v => {
				const raw = v[0];
				return digitNumber(parseInt(raw, 10), raw);
			})

			.map(CARDINAL_WORDS, l => literalNumber(l, String(l)))

			.map(MULTIPLIER_WORDS, l => literalNumber(l, String(l), true))

			// Digits + digits or digits + suffix, combines 1 000 and 1 tusen but not ett 000
			.add([ GraphBuilder.result(isDigits), GraphBuilder.result(v => isDigitsCompatible(v) && canFollowNumber(v)) ], v => combineNumbers(v[0], v[1]))

			// Literal + literal - to avoid combining things as `ett 000`
			.add([ GraphBuilder.result(isLiteral), GraphBuilder.result(v => isLiteral(v) && canFollowNumber(v)) ], v => combineNumbers(v[0], v[1]))

			// Scale word + digits, combines 2 tusen 5
			.add([ GraphBuilder.result(hasScaleWord), GraphBuilder.result(v => isDigits(v) && canFollowNumber(v)) ], v => combineNumbers(v[0], v[1]))

			.build();
	}
};
