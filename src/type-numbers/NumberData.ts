/**
 * Information about a number.
 */
export interface NumberData {
	value: number;

	rawDigits: string;

	integer: boolean;
	suffix: boolean;
	literal: boolean;
}
