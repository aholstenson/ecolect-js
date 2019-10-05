import { OrdinalData } from './OrdinalData';
import { OrdinalPrecision } from './OrdinalPrecision';
import { BigInteger } from 'numeric-types/integer';

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
 * Map data collected for an ordinal into a value.
 *
 * @param r
 */
export function mapOrdinal(r: OrdinalData): BigInteger | null {
	if(typeof r.value === 'undefined') return null;

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
