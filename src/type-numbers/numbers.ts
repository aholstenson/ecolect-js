import { BigDecimal } from 'numeric-types/decimal';
import { BigInteger } from 'numeric-types/integer';

import type { NumberData } from './NumberData.js';

export function isDigits(o: NumberData): boolean {
	return ! o.literal;
}

export function isDigitsCompatible(o: NumberData): boolean {
	return o.suffix || ! o.literal;
}

export function isLiteral(o: NumberData): boolean {
	return o.literal;
}

export function isNegative(o: NumberData): boolean {
	return o.value < 0;
}

/**
 * Get if a number can be the second part of a combined number. A number
 * that was made by adding or by joining digits can only be the first part.
 * This gives each sequence of numbers only one way to be read, as in
 * `(one hundred) five` but not `one (hundred five)`. Without this the number
 * of ways to read a long sequence grows very fast.
 *
 * @param o -
 *   the number to check
 * @returns
 *   `true` if the number can come after another number
 */
export function canFollowNumber(o: NumberData): boolean {
	return o.combinedBy !== 'add' && o.combinedBy !== 'join';
}

/**
 * Get if a number has a scale word, such as `2 thousand`. A smaller number
 * can be added after such a number, as in `2 thousand 5`.
 *
 * @param o -
 *   the number to check
 * @returns
 *   `true` if the number has a scale word
 */
export function hasScaleWord(o: NumberData): boolean {
	return typeof o.largestScale !== 'undefined';
}

export function literalNumber(value: number, raw: string, suffix=false): NumberData {
	return {
		value: value,
		rawDigits: raw,
		literal: true,

		suffix: suffix,
		integer: value % 1 === 0,
		...scaleWord(value, suffix)
	};
}

export function digitNumber(value: number, raw: string, suffix=false): NumberData {
	return {
		value: value,
		rawDigits: raw,
		literal: false,

		suffix: suffix,
		integer: value % 1 === 0,
		...scaleWord(value, suffix)
	};
}

/**
 * Get the scale fields of a single number word.
 *
 * @param value -
 *   the value of the word
 * @param suffix -
 *   if the word multiplies the number before it
 * @returns
 *   the scale fields to add to the number
 */
function scaleWord(value: number, suffix: boolean): Partial<NumberData> {
	if(! suffix) return {};

	return {
		multiplier: true,
		scale: value,
		largestScale: value
	};
}

/**
 * Combine two numbers when parsing. There are three ways to combine them:
 *
 * - A scale word multiplies the number before it, as in `three hundred`.
 *   The number before it must not have a larger scale, so that
 *   `two thousand three hundred` is not read as `2003 * 100`.
 * - A number after a scale word is added if it is smaller than the scale,
 *   as in `three hundred five` and `two thousand three hundred`.
 * - Two numbers without scale words are joined as groups of digits, as in
 *   `1 400`.
 *
 * @param a -
 *   the first number
 * @param b -
 *   the number after it
 * @returns
 *   the combined number, or `null` if the numbers do not form one number
 */
export function combineNumbers(a: NumberData, b: NumberData): NumberData | null {
	if(b.multiplier) {
		if(typeof a.largestScale !== 'undefined' && a.largestScale > b.value) {
			return null;
		}

		const value = a.value * b.value;
		return {
			value: value,
			rawDigits: String(value),
			integer: a.integer && b.integer,
			suffix: true,
			literal: true,
			combinedBy: 'multiply',
			scale: b.value,
			largestScale: b.value
		};
	} else if(typeof a.scale !== 'undefined') {
		if(b.value < 0 || b.value >= a.scale) {
			return null;
		}

		const value = a.value + b.value;
		return {
			value: value,
			rawDigits: String(value),
			integer: a.integer && b.integer,
			literal: a.literal || b.literal,
			suffix: false,
			combinedBy: 'add',
			scale: b.scale,
			largestScale: a.largestScale
		};
	} else {
		if(typeof a.largestScale !== 'undefined' || typeof b.largestScale !== 'undefined') {
			// A number with a scale word can not be joined as digits
			return null;
		}

		const raw = a.rawDigits + b.rawDigits;
		const value = parseInt(raw, 10);

		return {
			value: value,
			rawDigits: raw,
			integer: a.integer && b.integer,
			literal: a.literal || b.literal,
			suffix: false,
			combinedBy: 'join'
		};
	}
}

export function negative(o: NumberData): NumberData {
	return {
		value: - o.value,
		rawDigits: '-' + o.rawDigits,
		integer: o.integer,
		suffix: false,
		literal: o.literal
	};
}

export function float(a: NumberData, b: NumberData): NumberData {
	const raw = a.rawDigits + '.' + b.rawDigits;
	return {
		value: parseFloat(raw),
		rawDigits: raw,
		integer: false,
		literal: false,
		suffix: false
	};
}

export function mapNumber(data: NumberData) {
	return BigDecimal.parse(data.rawDigits);
}

export function mapInteger(data: NumberData) {
	return BigInteger.parse(data.rawDigits);
}
