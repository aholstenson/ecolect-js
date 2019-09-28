import { OrdinalData } from './ordinal-data';
import { OrdinalValue } from './ordinal-value';
import { OrdinalPrecision } from './ordinal-precision';
import { Precision } from '../time/precision';

export function specificOrdinal(value: number): OrdinalData {
	return {
		value: value,
		precision: OrdinalPrecision.Specific
	};
}

export function ambigiousOrdinal(value: number): OrdinalData {
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
export function map(r: OrdinalData): OrdinalValue | null {
	if(typeof r.value === 'undefined') return null;

	return {
		value: r.value
	};
}

/**
 * Determine if an ordinal is specific.
 *
 * @param value
 */
export function isSpecific(value: OrdinalData): boolean {
	return value.precision === OrdinalPrecision.Specific;
}
