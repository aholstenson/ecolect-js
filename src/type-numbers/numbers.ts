import { BigDecimal } from 'numeric-types/decimal';
import { BigInteger } from 'numeric-types/integer';

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
 * Get if a number has a scale word, such as `2 thousand`. A smaller number
 * can be added after such a number, as in `2 thousand 5`.
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
		parts: [ { scale: value, value: value } ]
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
	if(! parts || parts.every(p => p.scale <= scale)) {
		// No part has a larger scale, multiply all of the number
		kept = [];
		multiplied = a.value;
	} else {
		// Multiply only the parts after the last part with a larger scale
		const smaller = parts.filter(p => p.scale < scale);
		if(smaller.length === 0 || parts.some(p => p.scale === scale)) {
			return null;
		}

		kept = parts.filter(p => p.scale > scale);
		multiplied = sum(smaller);
	}

	const part = { scale: scale, value: multiplied * scale };
	const value = sum(kept) + part.value;
	return {
		value: value,
		rawDigits: String(value),
		integer: a.integer && b.integer,
		suffix: true,
		literal: true,
		combined: true,
		parts: [ ...kept, part ]
	};
}

/**
 * Add a number without a scale word to a number with scale words.
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

	const value = a.value + b.value;
	return {
		value: value,
		rawDigits: String(value),
		integer: a.integer && b.integer,
		literal: a.literal || b.literal,
		suffix: false,
		combined: true,
		parts: [ ...parts, { scale: 1, value: b.value } ]
	};
}

/**
 * Join two numbers without scale words as groups of digits.
 *
 * @param a -
 *   the number read so far
 * @param b -
 *   the group of digits after it
 * @returns
 *   the combined number
 */
function joinNumbers(a: NumberData, b: NumberData): NumberData {
	const raw = a.rawDigits + b.rawDigits;
	return {
		value: parseInt(raw, 10),
		rawDigits: raw,
		integer: a.integer && b.integer,
		literal: a.literal || b.literal,
		suffix: false,
		combined: true
	};
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
