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
	 * If the number was combined from more than one word or group of digits.
	 * Numbers are combined from left to right, so only a number that is not
	 * combined can come after another number.
	 */
	combined?: boolean;

	/**
	 * The parts of a number that has scale words, from the largest scale to
	 * the smallest. `two thousand three hundred five` has the parts 2000
	 * (scale 1000), 300 (scale 100) and 5 (scale 1). Not set when the number
	 * has no scale word.
	 */
	parts?: NumberPart[];
}

/**
 * A part of a number that has scale words, such as `three hundred` in
 * `two thousand three hundred`.
 */
export interface NumberPart {
	/**
	 * The scale of the part, such as `100` for `three hundred`. A part that
	 * has no scale word has the scale `1`.
	 */
	scale: number;

	/**
	 * The value of the part, such as `300` for `three hundred`.
	 */
	value: number;
}
