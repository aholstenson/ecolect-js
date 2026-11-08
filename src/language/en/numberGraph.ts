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

/**
 * Get if a number can get a minus sign. A number that already has a sign
 * does not get another one, so `minus minus 5` is not read as a number.
 *
 * @param o -
 *   the number to check
 * @returns
 *   `true` if the number is not negative
 */
function isPositiveNumber(o: NumberData): boolean {
	return isNumber(o) && ! isNegative(o);
}

/**
 * The largest exponent, in both directions. A JavaScript number can not hold
 * a number with a larger exponent.
 */
const MAX_EXPONENT = 308;

/**
 * Get if a number can get an exponent. A number that already has one does
 * not get another one.
 *
 * @param o -
 *   the number to check
 * @returns
 *   `true` if the number has no exponent
 */
function canHaveExponent(o: NumberData): boolean {
	return isNumber(o) && ! o.exponent;
}

/**
 * Give a number an exponent, as in `1e3` or `1e-3`.
 *
 * @param base -
 *   the number before the exponent
 * @param digits -
 *   the digits of the exponent
 * @param sign -
 *   `1` for a positive exponent and `-1` for a negative one
 * @returns
 *   the number, or `null` if the exponent is too large
 */
function withExponent(base: NumberData, digits: string, sign: 1 | -1): NumberData | null {
	const exponent = parseInt(digits, 10);
	if(exponent > MAX_EXPONENT) return null;

	const result = combineNumbers(base, powerOfTen(sign * exponent));
	return result && { ...result, exponent: true };
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
			// The decimal part is one group of digits, so that `1.5 2` is not read as 1.52
			.add([ integer, '.', GraphBuilder.result(integer, v => ! v.suffix && ! v.combined && ! isNegative(v)) ], v => float(v[0], v[1]))

			.add([ GraphBuilder.result(canHaveExponent), 'e', /^[0-9]+$/ ], v => withExponent(v[0], v[1], 1))
			.add([ GraphBuilder.result(canHaveExponent), 'e', '-', /^[0-9]+$/ ], v => withExponent(v[0], v[1], -1))

			.add([ '-', GraphBuilder.result(isPositiveNumber) ], v => negative(v[0]))
			.add([ 'minus', GraphBuilder.result(isPositiveNumber) ], v => negative(v[0]))
			.add([ 'negative', GraphBuilder.result(isPositiveNumber) ], v => negative(v[0]))

			.build();
	}
};
