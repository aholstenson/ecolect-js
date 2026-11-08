import { BigInteger } from 'numeric-types/integer';

import type { OrdinalData } from './OrdinalData.js';
import { OrdinalPrecision } from './OrdinalPrecision.js';

export function specificOrdinal(value: number): OrdinalData {
	return {
		value: value,
		precision: OrdinalPrecision.Specific
	};
}

export function ambiguousOrdinal(value: number): OrdinalData {
	return {
		value: value,
		precision: OrdinalPrecision.Ambiguous
	};
}

/**
 * Map data collected for an ordinal into a value. An ordinal that is too
 * large to be exact as a JavaScript number, such as the `1e30`th, is not
 * real input and gives no value.
 *
 * @param r -
 *   the data collected for the ordinal
 * @returns
 *   the ordinal, or `null` if there is no value or it is too large
 */
export function mapOrdinal(r: OrdinalData): BigInteger | null {
	if(typeof r.value === 'undefined') return null;
	if(! Number.isSafeInteger(r.value)) return null;

	return BigInteger.fromNumber(r.value);
}

/**
 * Determine if an ordinal is specific.
 *
 * @param value
 */
export function isSpecific(value: OrdinalData): boolean {
	return value.precision === OrdinalPrecision.Specific;
}
