/*
 * Jaro and Jaro-Winkler string similarity.
 *
 * Adapted from Talisman (`metrics/distance/jaro` and
 * `metrics/distance/jaro-winkler`), which is available under the MIT license.
 * Copyright (c) 2016 Guillaume Plique (Yomguithereal).
 *
 * Reference: https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance
 *
 * Articles:
 * Jaro, M. A. (1989). "Advances in record linkage methodology as applied to
 * the 1985 census of Tampa Florida". Journal of the American Statistical
 * Association 84 (406): 414-20.
 *
 * Winkler, W. E. (1990). "String Comparator Metrics and Enhanced Decision
 * Rules in the Fellegi-Sunter Model of Record Linkage". Proceedings of the
 * Section on Survey Research Methods (American Statistical Association):
 * 354-359.
 */

const BOOST_THRESHOLD = 0.7;
const SCALING_FACTOR = 0.1;

/**
 * Surrogate code units, which are half of a character outside the Basic
 * Multilingual Plane, such as `𝐡` or `𠀀`.
 */
const SURROGATE = /[\uD800-\uDFFF]/;

/**
 * Get the characters of a string. A string without surrogates is returned as
 * it is, as each code unit is then a character. Other strings are split into
 * code points, so that a character outside the Basic Multilingual Plane is
 * one character and not two halves that can match the halves of another.
 *
 * @param text -
 *   the string
 * @returns
 *   the characters of the string
 */
export function characters(text: string): ArrayLike<string> {
	return SURROGATE.test(text) ? Array.from(text) : text;
}

/**
 * Calculate the Jaro similarity of two strings. The strings are compared by
 * code points.
 *
 * @param a -
 *   the first string
 * @param b -
 *   the second string
 * @returns
 *   similarity between 0 and 1, where 1 means the strings are equal
 */
export function jaroSimilarity(a: string, b: string): number {
	if(a === b) return 1;

	return jaro(characters(a), characters(b));
}

/**
 * Calculate the Jaro similarity of two lists of characters.
 *
 * @param a -
 *   the characters of the first string
 * @param b -
 *   the characters of the second string
 * @returns
 *   similarity between 0 and 1, where 1 means the strings are equal
 */
function jaro(a: ArrayLike<string>, b: ArrayLike<string>): number {
	let max: ArrayLike<string>;
	let min: ArrayLike<string>;

	if(a.length > b.length) {
		max = a;
		min = b;
	} else {
		max = b;
		min = a;
	}

	const range = Math.max(((max.length / 2) | 0) - 1, 0);
	const indexes: number[] = new Array(min.length).fill(-1);
	const flags: boolean[] = new Array(max.length).fill(false);

	let matches = 0;
	for(let i = 0; i < min.length; i++) {
		const character = min[i];
		const xi = Math.max(i - range, 0);
		const xn = Math.min(i + range + 1, max.length);

		for(let j = xi; j < xn; j++) {
			if(! flags[j] && character === max[j]) {
				indexes[i] = j;
				flags[j] = true;
				matches++;
				break;
			}
		}
	}

	if(! matches) return 0;

	const ms1: string[] = new Array(matches);
	const ms2: string[] = new Array(matches);

	let si = 0;
	for(let i = 0; i < min.length; i++) {
		if(indexes[i] !== -1) {
			ms1[si] = min[i];
			si++;
		}
	}

	si = 0;
	for(let i = 0; i < max.length; i++) {
		if(flags[i]) {
			ms2[si] = max[i];
			si++;
		}
	}

	let transpositions = 0;
	for(let i = 0; i < ms1.length; i++) {
		if(ms1[i] !== ms2[i]) transpositions++;
	}

	const t = (transpositions / 2) | 0;
	const m = matches;

	return ((m / a.length) + (m / b.length) + ((m - t) / m)) / 3;
}

/**
 * Calculate the Jaro-Winkler similarity of two strings. Jaro-Winkler gives a
 * higher score to strings that share a prefix of up to four characters. The
 * strings are compared by code points.
 *
 * @param a -
 *   the first string
 * @param b -
 *   the second string
 * @returns
 *   similarity between 0 and 1, where 1 means the strings are equal
 */
export function jaroWinklerSimilarity(a: string, b: string): number {
	if(a === b) return 1;

	const ca = characters(a);
	const cb = characters(b);

	const dj = jaro(ca, cb);
	if(dj < BOOST_THRESHOLD) return dj;

	let l = 0;
	const prefixLimit = Math.min(ca.length, cb.length, 4);
	for(let i = 0; i < prefixLimit; i++) {
		if(ca[i] === cb[i]) {
			l++;
		} else {
			break;
		}
	}

	return dj + (l * SCALING_FACTOR * (1 - dj));
}
