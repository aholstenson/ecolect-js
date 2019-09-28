import { OrdinalPrecision } from './ordinal-precision';

/**
 * Data that describes an ordinal.
 */
export interface OrdinalData {
	value: number;

	precision: OrdinalPrecision;
}
