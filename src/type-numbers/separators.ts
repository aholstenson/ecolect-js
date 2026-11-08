import type { ValueResolver } from '../graph/CollectorNode.js';
import { resolveLocale } from '../language/resolveLocale.js';

import type { NumberData } from './NumberData.js';
import { canFollowNumber, combineNumbers, float, isDigits, isNegative } from './numbers.js';

/**
 * Options that set the characters that numbers are written with. A locale
 * sets both, so they are only set directly to read numbers in a way the
 * locale does not.
 */
export interface NumberSeparatorOptions {
	/**
	 * The character that separates the whole part of a number from its
	 * fraction, such as `.` in `1.5` or `,` in `1,5`.
	 */
	decimalSeparator?: string;

	/**
	 * The character that groups the digits of large numbers, such as `,` in
	 * `1,000`. A space can always group digits, as in `1 000`.
	 */
	groupSeparator?: string;
}

/**
 * The characters that can separate the fraction of a number, or group its
 * digits. A graph has a rule for each of them, and only the rules for the
 * characters of the locale give a number.
 */
export const NUMBER_SEPARATORS = [ '.', ',' ] as const;

/**
 * Get if a number can come before a group separator, as the `1` in `1,000`.
 * This is a group of one to three digits, or a number that already has a
 * group separator.
 *
 * @param v -
 *   the number to check
 * @returns
 *   `true` if a group separator can follow the number
 */
export function isThousandsStart(v: NumberData): boolean {
	return isDigits(v) && (v.combined === true || v.rawDigits.length <= 3);
}

/**
 * Get if a number is a group of three digits that can come after a group
 * separator, as the `000` in `1,000`.
 *
 * @param v -
 *   the number to check
 * @returns
 *   `true` if the number is a group of three digits
 */
export function isThousandsGroup(v: NumberData): boolean {
	return isDigits(v) && canFollowNumber(v) && v.rawDigits.length === 3;
}

/**
 * Get if a number can be the fraction of a decimal number. The fraction is
 * one group of digits, so that `1.5 2` is not read as 1.52.
 *
 * @param v -
 *   the number to check
 * @returns
 *   `true` if the number can be a fraction
 */
export function isFraction(v: NumberData): boolean {
	return ! v.suffix && ! v.combined && ! isNegative(v);
}

/**
 * Get the separators to read numbers with. The options of a match decide,
 * and the locale of the language decides what the options leave out.
 *
 * @param locale -
 *   the locale of the language the graph was created for
 * @param options -
 *   the options of the match
 * @returns
 *   the decimal and the group separator
 */
function separatorsFor(locale: string, options: NumberSeparatorOptions | undefined) {
	const settings = resolveLocale(locale);
	return {
		decimal: options?.decimalSeparator ?? settings.decimalSeparator,
		group: options?.groupSeparator ?? settings.groupSeparator
	};
}

/**
 * Create the value of a rule that joins two groups of digits with a group
 * separator, as in `1,000`. The rule gives no number when the separator is
 * not the group separator of the match, so `1,000` is 1000 for `en-US` but
 * not for `en-ZA`, which writes it as `1 000`.
 *
 * @param locale -
 *   the locale of the language the graph was created for
 * @param separator -
 *   the separator of the rule
 * @returns
 *   the value of the rule
 */
export function groupedNumber(locale: string, separator: string): ValueResolver<NumberData> {
	return (v, options: NumberSeparatorOptions | undefined) => {
		return separatorsFor(locale, options).group === separator
			? combineNumbers(v[0], v[1])
			: null;
	};
}

/**
 * Create the value of a rule that reads a decimal number, as in `1.5`. The
 * rule gives no number when the separator is not the decimal separator of
 * the match, so `1,5` is 1.5 for `sv-SE` but not for `en-US`.
 *
 * @param locale -
 *   the locale of the language the graph was created for
 * @param separator -
 *   the separator of the rule
 * @returns
 *   the value of the rule
 */
export function decimalNumber(locale: string, separator: string): ValueResolver<NumberData> {
	return (v, options: NumberSeparatorOptions | undefined) => {
		return separatorsFor(locale, options).decimal === separator
			? float(v[0], v[1])
			: null;
	};
}
