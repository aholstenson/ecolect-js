import { BigDecimal } from 'numeric-types/decimal';
import { BigInteger } from 'numeric-types/integer';

import { addDecimals, multiplyDecimals, powerOfTenDecimal } from './decimals.js';
import type { NumberData, NumberPart } from './NumberData.js';

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
 * Get if a number can be the second part of a combined number. Numbers are
 * combined from left to right, one word or group of digits at a time, so
 * only a number that is not combined can come after another number. This
 * gives each sequence of numbers only one way to be read. Without this the
 * number of ways to read a long sequence grows very fast.
 *
 * @param o -
 *   the number to check
 * @returns
 *   `true` if the number can come after another number
 */
export function canFollowNumber(o: NumberData): boolean {
	return ! o.combined;
}

/**
 * Get if a number has a scale word, such as `2 thousand`, or is a tens word,
 * such as `twenty`. A smaller number can be added after such a number, as in
 * `2 thousand 5` or `twenty 1`.
 *
 * @param o -
 *   the number to check
 * @returns
 *   `true` if the number has a scale word
 */
export function hasScaleWord(o: NumberData): boolean {
	return typeof o.parts !== 'undefined';
}

export function literalNumber(value: number, raw: string, suffix=false): NumberData {
	return {
		value: value,
		rawDigits: raw,
		literal: true,

		suffix: suffix,
		integer: value % 1 === 0,
		...scaleWord(value, raw, suffix)
	};
}

export function digitNumber(value: number, raw: string, suffix=false): NumberData {
	return {
		value: value,
		rawDigits: raw,
		literal: false,

		suffix: suffix,
		integer: value % 1 === 0,
		...scaleWord(value, raw, suffix)
	};
}

/**
 * Create a number for ten to the given power, which multiplies the number
 * before it, as the `e3` in `1.5e3`.
 *
 * @param exponent -
 *   the power, such as `3` or `-2`
 * @returns
 *   the number
 */
export function powerOfTen(exponent: number): NumberData {
	return digitNumber(Math.pow(10, exponent), powerOfTenDecimal(exponent), true);
}

/**
 * Create a number for a tens word, such as `twenty`. A smaller number can be
 * added after a tens word, so `twenty one` is 21 and not the digits `201`.
 *
 * @param value -
 *   the value of the word, such as `20`
 * @param raw -
 *   the digits of the value
 * @returns
 *   the number
 */
export function tensNumber(value: number, raw: string): NumberData {
	return {
		value: value,
		rawDigits: raw,
		literal: true,

		suffix: false,
		integer: true,
		parts: [ { scale: 10, value: value, digits: raw } ]
	};
}

/**
 * Get the scale fields of a single number word.
 *
 * @param value -
 *   the value of the word
 * @param raw -
 *   the digits of the value
 * @param suffix -
 *   if the word multiplies the number before it
 * @returns
 *   the scale fields to add to the number
 */
function scaleWord(value: number, raw: string, suffix: boolean): Partial<NumberData> {
	if(! suffix) return {};

	return {
		multiplier: true,
		parts: [ { scale: value, value: value, digits: raw } ]
	};
}

/**
 * Combine a number with the single word or group of digits after it. There
 * are three ways to combine them:
 *
 * - A scale word multiplies the parts of the number that have a smaller
 *   scale, as in `two thousand (three hundred)`. When no part has a larger
 *   scale, all of the number is multiplied, as in `(one hundred five)
 *   thousand`.
 * - A number after a scale word is added if it is smaller than the scale,
 *   as in `three hundred five`.
 * - Two numbers without scale words are joined as groups of digits, as in
 *   `1 400`.
 *
 * @param a -
 *   the number read so far
 * @param b -
 *   the word or group of digits after it
 * A number that is too large for a JavaScript number is not combined
 * further. No real input has such a number, and the exact math on its
 * digits gets slow.
 *
 * @returns
 *   the combined number, or `null` if the numbers do not form one number
 */
export function combineNumbers(a: NumberData, b: NumberData): NumberData | null {
	if(b.combined) return null;

	if(b.multiplier) {
		return multiplyNumber(a, b);
	} else if(a.parts) {
		return addToNumber(a, a.parts, b);
	} else {
		return joinNumbers(a, b);
	}
}

/**
 * Multiply a number with a scale word.
 *
 * @param a -
 *   the number read so far
 * @param b -
 *   the scale word
 * @returns
 *   the combined number, or `null` if the scale word can not follow
 */
function multiplyNumber(a: NumberData, b: NumberData): NumberData | null {
	const scale = b.value;
	const parts = a.parts;

	let kept: NumberPart[];
	let multiplied: number;
	let multipliedDigits: string;
	if(! parts || parts.every(p => p.scale <= scale)) {
		// No part has a larger scale, multiply all of the number
		kept = [];
		multiplied = a.value;
		multipliedDigits = a.rawDigits;
	} else {
		// Multiply only the parts after the last part with a larger scale
		const smaller = parts.filter(p => p.scale < scale);
		if(smaller.length === 0 || parts.some(p => p.scale === scale)) {
			return null;
		}

		kept = parts.filter(p => p.scale > scale);
		multiplied = sum(smaller);
		multipliedDigits = sumDigits(smaller);
	}

	const partValue = multiplied * scale;
	const value = sum(kept) + partValue;
	if(! Number.isFinite(value)) return null;

	const part = {
		scale: scale,
		value: partValue,
		digits: multiplyDecimals(multipliedDigits, b.rawDigits)
	};
	return {
		value: value,
		rawDigits: addDecimals(sumDigits(kept), part.digits),
		integer: a.integer && b.integer,
		suffix: true,
		literal: true,
		combined: true,
		parts: [ ...kept, part ]
	};
}

/**
 * Add a number without a scale word to a number with scale words. The
 * number to add can be a tens word, as in `two hundred twenty`, and then
 * its scale is kept, so that a number can be added after it.
 *
 * @param a -
 *   the number read so far
 * @param parts -
 *   the parts of the number read so far
 * @param b -
 *   the number to add
 * @returns
 *   the combined number, or `null` if the number is not smaller than the
 *   scale of the last part
 */
function addToNumber(a: NumberData, parts: NumberPart[], b: NumberData): NumberData | null {
	const last = parts[parts.length - 1];
	if(last.scale <= 1 || b.value < 0 || b.value >= last.scale) {
		return null;
	}

	const added = b.parts ?? [ { scale: 1, value: b.value, digits: b.rawDigits } ];

	const value = a.value + b.value;
	if(! Number.isFinite(value)) return null;

	return {
		value: value,
		rawDigits: addDecimals(a.rawDigits, b.rawDigits),
		integer: a.integer && b.integer,
		literal: a.literal || b.literal,
		suffix: false,
		combined: true,
		parts: [ ...parts, ...added ]
	};
}

/**
 * Join two numbers without scale words as groups of digits. Digits can not
 * be joined after a decimal part, as `1.5 2` is two numbers and not `1.52`.
 *
 * @param a -
 *   the number read so far
 * @param b -
 *   the group of digits after it
 * @returns
 *   the combined number, or `null` if the number read so far has a decimal
 *   part
 */
function joinNumbers(a: NumberData, b: NumberData): NumberData | null {
	if(! a.integer) return null;

	const raw = a.rawDigits + b.rawDigits;
	const value = parseInt(raw, 10);
	if(! Number.isFinite(value)) return null;

	return {
		value: value,
		rawDigits: raw,
		integer: a.integer && b.integer,
		literal: a.literal || b.literal,
		suffix: false,
		combined: true
	};
}

/**
 * Get the exact sum of the values of the given parts.
 *
 * @param parts -
 *   the parts to sum
 * @returns
 *   the sum as a decimal number
 */
function sumDigits(parts: NumberPart[]): string {
	let result = '0';
	for(const p of parts) {
		result = addDecimals(result, p.digits);
	}
	return result;
}

/**
 * Get the sum of the values of the given parts.
 *
 * @param parts -
 *   the parts to sum
 * @returns
 *   the sum of the values
 */
function sum(parts: NumberPart[]): number {
	let result = 0;
	for(const p of parts) {
		result += p.value;
	}
	return result;
}

/**
 * Change the sign of a number.
 *
 * @param o -
 *   the number
 * @returns
 *   the number with the other sign
 */
export function negative(o: NumberData): NumberData {
	return {
		value: - o.value,
		rawDigits: o.rawDigits.startsWith('-') ? o.rawDigits.substring(1) : '-' + o.rawDigits,
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
