import type { ValueResolver } from '../graph/CollectorNode.js';
import type { Encounter } from '../graph/matching/index.js';
import { resolveLocale } from '../language/resolveLocale.js';

import type { NumberData } from './NumberData.js';
import { canFollowNumber, combineNumbers, float, isDigits, isNegative } from './numbers.js';

/**
 * How a match reads the separator that its locale does not use for
 * fractions. Of `.` and `,`, this is the one that is not the decimal
 * separator of the locale, such as `.` for `sv-SE`.
 *
 * - `strict` reads only the separators of the locale.
 * - `auto` also reads the other separator when the locale does not use it to
 *   group digits. `sv-SE` groups digits with a space, so `24.00` is 24 and
 *   `1.000` is 1000. `en-US` groups digits with `,`, so it reads only `1.5`.
 * - `lenient` always reads the other separator. `en-US` then also reads
 *   `24,00` as 24, while `1,000` stays 1000.
 */
export type NumberSeparatorMode = 'strict' | 'auto' | 'lenient';

/**
 * How to read a separator that can both group digits and separate a
 * fraction, when three digits come after it, as in `1.000`.
 *
 * - `group` reads it as a group separator, so `1.000` is 1000.
 * - `decimal` reads it as a decimal separator, so `1.000` is 1. A number
 *   with more than one separator, such as `1.000.000` or `1.000,5`, still
 *   groups its digits.
 */
export type AmbiguousSeparator = 'group' | 'decimal';

/**
 * Options that set the characters that numbers are written with. A locale
 * sets both, so they are only set directly to read numbers in a way the
 * locale does not.
 */
export interface NumberSeparatorOptions {
	/**
	 * The character that separates the whole part of a number from its
	 * fraction, such as `.` in `1.5` or `,` in `1,5`. A list accepts each of
	 * its characters, and the first one is used to write numbers.
	 *
	 * Setting this or `groupSeparator` names the separators in full, so
	 * `numberSeparators` adds nothing to them.
	 */
	decimalSeparator?: string | readonly string[];

	/**
	 * The character that groups the digits of large numbers, such as `,` in
	 * `1,000`. A list accepts each of its characters. A space can always
	 * group digits, as in `1 000`.
	 */
	groupSeparator?: string | readonly string[];

	/**
	 * How to read the separator that the locale does not use for fractions.
	 * The default is `auto`.
	 */
	numberSeparators?: NumberSeparatorMode;

	/**
	 * How to read a separator that can both group digits and separate a
	 * fraction, when three digits come after it. The default is `group`.
	 */
	ambiguousSeparator?: AmbiguousSeparator;
}

/**
 * The separators that a match reads numbers with, after the options and the
 * locale are combined.
 */
export interface NumberSeparators {
	/**
	 * The characters that separate a fraction. The first one is used to
	 * write numbers.
	 */
	readonly decimal: readonly string[];

	/**
	 * The characters that group digits, in addition to a space.
	 */
	readonly group: readonly string[];

	/**
	 * How to read a character that is in both lists.
	 */
	readonly ambiguous: AmbiguousSeparator;
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
 * Make a list of separators from an option. Empty strings are left out, as a
 * locale that does not group digits has an empty group separator.
 *
 * @param value -
 *   one separator or a list of them
 * @returns
 *   the list of separators
 */
function toList(value: string | readonly string[]): readonly string[] {
	const list = typeof value === 'string' ? [ value ] : value;
	return list.filter(separator => separator.length > 0);
}

/**
 * Combine the separators of a locale with the options of a match.
 *
 * A separator set directly in the options is used as it is. Otherwise the
 * separators of the locale are used, and `numberSeparators` decides if the
 * other of `.` and `,` is also read. When it is, it is read both as a
 * decimal and as a group separator, and `ambiguousSeparator` decides how to
 * read it when three digits come after it.
 *
 * @param settings -
 *   the separators of the locale
 * @param options -
 *   the options of the match
 * @returns
 *   the separators to read numbers with
 */
export function resolveNumberSeparators(
	settings: { readonly decimalSeparator: string; readonly groupSeparator: string },
	options: NumberSeparatorOptions
): NumberSeparators {
	const ambiguous = options.ambiguousSeparator ?? 'group';
	const decimal = toList(options.decimalSeparator ?? settings.decimalSeparator);
	const group = toList(options.groupSeparator ?? settings.groupSeparator);

	const mode = options.numberSeparators ?? 'auto';
	const direct = typeof options.decimalSeparator !== 'undefined'
		|| typeof options.groupSeparator !== 'undefined';

	if(direct || mode === 'strict') {
		return { decimal, group, ambiguous };
	}

	// Only a locale that writes fractions with `.` or `,` has another one to read
	const other = NUMBER_SEPARATORS.find(separator => separator !== settings.decimalSeparator);
	if(! (NUMBER_SEPARATORS as readonly string[]).includes(settings.decimalSeparator) || ! other) {
		return { decimal, group, ambiguous };
	}

	if(group.includes(other)) {
		return mode === 'lenient'
			? { decimal: [ ...decimal, other ], group, ambiguous }
			: { decimal, group, ambiguous };
	}

	return {
		decimal: [ ...decimal, other ],
		group: [ ...group, other ],
		ambiguous
	};
}

/**
 * Get the separators to read numbers with. A match through a locale aware
 * matcher already has them as lists in its options. Otherwise the options
 * are combined with the locale of the language here.
 *
 * @param locale -
 *   the locale of the language the graph was created for
 * @param options -
 *   the options of the match
 * @returns
 *   the separators to read numbers with
 */
function separatorsFor(locale: string, options: NumberSeparatorOptions | undefined): NumberSeparators {
	if(options && Array.isArray(options.decimalSeparator) && Array.isArray(options.groupSeparator)) {
		return {
			decimal: options.decimalSeparator,
			group: options.groupSeparator,
			ambiguous: options.ambiguousSeparator ?? 'group'
		};
	}

	return resolveNumberSeparators(resolveLocale(locale), options ?? {});
}

/**
 * Get if another separator comes directly after the part of the expression
 * that was matched, such as the `.` after `1.000` in `1.000.000` or the `,`
 * in `1.000,5`. The number then has more than one separator, so a separator
 * before it groups digits.
 *
 * @param encounter -
 *   the encounter of the match
 * @param separators -
 *   the separators of the match
 * @returns
 *   `true` if a separator comes next
 */
function isFollowedBySeparator(encounter: Encounter | undefined, separators: NumberSeparators): boolean {
	const token = encounter?.tokens[encounter.currentIndex];
	if(! token) {
		return false;
	}

	return separators.decimal.includes(token.raw) || separators.group.includes(token.raw);
}

/**
 * Create the value of a rule that joins two groups of digits with a group
 * separator, as in `1,000`. The rule gives no number when the separator is
 * not a group separator of the match, so `1,000` is 1000 for `en-US` but
 * not for `en-ZA`, which writes it as `1 000`.
 *
 * A separator that also separates fractions does not group the first three
 * digits when `ambiguousSeparator` is `decimal`, unless another separator
 * comes after them.
 *
 * @param locale -
 *   the locale of the language the graph was created for
 * @param separator -
 *   the separator of the rule
 * @returns
 *   the value of the rule
 */
export function groupedNumber(locale: string, separator: string): ValueResolver<NumberData> {
	return (v, options: NumberSeparatorOptions | undefined, encounter) => {
		const separators = separatorsFor(locale, options);
		if(! separators.group.includes(separator)) {
			return null;
		}

		if(separators.ambiguous === 'decimal'
			&& separators.decimal.includes(separator)
			&& v[0].combined !== true
			&& ! isFollowedBySeparator(encounter, separators)) {
			return null;
		}

		return combineNumbers(v[0], v[1]);
	};
}

/**
 * Create the value of a rule that reads a decimal number, as in `1.5`. The
 * rule gives no number when the separator is not a decimal separator of the
 * match, so `1,5` is 1.5 for `sv-SE` but not for `en-US`.
 *
 * A separator that also groups digits does not separate a fraction of three
 * digits when the digits before it can be grouped, as `1.000` is then read
 * as 1000. When `ambiguousSeparator` is `decimal` this is only so for a
 * number that already has a separator, such as `1.000.000`.
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
		const separators = separatorsFor(locale, options);
		if(! separators.decimal.includes(separator)) {
			return null;
		}

		if(separators.group.includes(separator)
			&& isThousandsStart(v[0])
			&& isThousandsGroup(v[1])
			&& (separators.ambiguous === 'group' || v[0].combined === true)) {
			return null;
		}

		return float(v[0], v[1]);
	};
}
