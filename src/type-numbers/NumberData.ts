/**
 * Information about a number.
 */
export interface NumberData {
	value: number;

	rawDigits: string;

	integer: boolean;
	suffix: boolean;
	literal: boolean;

	/**
	 * If this is a single word that multiplies the number before it, such as
	 * `hundred` or `thousand`.
	 */
	multiplier?: boolean;

	/**
	 * The scale of the last group of the number, such as `100` for
	 * `three hundred` and for `two thousand three hundred`. A number that is
	 * smaller than the scale can be added after it, as in
	 * `three hundred five`. Not set when the number does not end with a
	 * scale word.
	 */
	scale?: number;

	/**
	 * How the number was combined from smaller numbers. Not set for a single
	 * word or a single group of digits.
	 */
	combinedBy?: 'multiply' | 'add' | 'join';

	/**
	 * The largest scale word in the number, such as `1000` for
	 * `two thousand three hundred`. Not set when the number has no scale
	 * word.
	 */
	largestScale?: number;
}
