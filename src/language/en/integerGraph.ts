import { GraphBuilder } from '../../graph/index.js';
import type {
	NumberData} from '../../type-numbers/index.js';
import {

	literalNumber,
	digitNumber,
	tensNumber,

	canFollowNumber,
	combineNumbers,
	hasScaleWord,

	isDigits,
	isDigitsCompatible,
	isLiteral,
} from '../../type-numbers/index.js';
import type { LanguageGraphFactory } from '../index.js';

/**
 * Get if a number can come before a thousands separator, as the `1` in
 * `1,000`. This is a group of one to three digits, or a number that already
 * has a thousands separator.
 *
 * @param v -
 *   the number to check
 * @returns
 *   `true` if a thousands separator can follow the number
 */
function isThousandsStart(v: NumberData): boolean {
	return isDigits(v) && (v.combined === true || v.rawDigits.length <= 3);
}

/**
 * Get if a number is a group of three digits that can come after a
 * thousands separator, as the `000` in `1,000`.
 *
 * @param v -
 *   the number to check
 * @returns
 *   `true` if the number is a group of three digits
 */
function isThousandsGroup(v: NumberData): boolean {
	return isDigits(v) && canFollowNumber(v) && v.rawDigits.length === 3;
}

export const integerGraph: LanguageGraphFactory<NumberData> = {
	id: 'integer',

	create(language) {
		return new GraphBuilder<NumberData>(language)
			.name('integer')

			.add(/^[0-9]+$/, v => {
				const raw = v[0];
				return digitNumber(parseInt(raw, 10), raw);
			})

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
				l => literalNumber(l, String(l))
			)

			.map(
				{
					'twenty': 20,
					'thirty': 30,
					'forty': 40,
					'fifty': 50,
					'sixty': 60,
					'seventy': 70,
					'eighty': 80,
					'ninety': 90
				},
				l => tensNumber(l, String(l))
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
				l => literalNumber(l, String(l), true)
			)

			// Digits + digits or digits + suffix, combines 1 000 and 1 thousand but not one 000
			.add([ GraphBuilder.result(isDigits), GraphBuilder.result(v => isDigitsCompatible(v) && canFollowNumber(v)) ], v => combineNumbers(v[0], v[1]))

			// Literal + literal - to avoid combining things as `one 000`
			.add([ GraphBuilder.result(isLiteral), GraphBuilder.result(v => isLiteral(v) && canFollowNumber(v)) ], v => combineNumbers(v[0], v[1]))

			// Scale word + digits, combines 2 thousand 5
			.add([ GraphBuilder.result(hasScaleWord), GraphBuilder.result(v => isDigits(v) && canFollowNumber(v)) ], v => combineNumbers(v[0], v[1]))

			// A scale word after `a`, as in `a hundred` or `a dozen`
			.add([ 'a', GraphBuilder.result(v => v.multiplier === true && canFollowNumber(v)) ], v => ({ ...v[0], combined: true }))

			// `and` before the last part, as in `one hundred and five`
			.add([ GraphBuilder.result(hasScaleWord), 'and', GraphBuilder.result(v => ! v.multiplier && canFollowNumber(v)) ], v => combineNumbers(v[0], v[1]))

			/*
			 * Thousands separator. The group after a comma has three digits,
			 * so that `1,5` is not read as 15.
			 */
			.add([ GraphBuilder.result(isThousandsStart), ',', GraphBuilder.result(isThousandsGroup) ], v => combineNumbers(v[0], v[1]))

			.build();
	}
};
