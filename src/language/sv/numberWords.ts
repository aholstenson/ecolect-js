/*
 * The Swedish words for numbers. Swedish writes the numbers up to 99 as a
 * single word, so `21` is `tjugoett` and not `tjugo ett`. The words are
 * built here instead of being listed one by one.
 */

/**
 * The words for 0 to 9. One is both `en` and `ett`, as Swedish picks the
 * form from the gender of what is counted.
 */
const ONES: Readonly<Record<string, number>> = {
	'noll': 0,
	'en': 1,
	'ett': 1,
	'två': 2,
	'tre': 3,
	'fyra': 4,
	'fem': 5,
	'sex': 6,
	'sju': 7,
	'åtta': 8,
	'nio': 9
};

/**
 * The words for 10 to 19, which have shapes of their own.
 */
const TEENS: Readonly<Record<string, number>> = {
	'tio': 10,
	'elva': 11,
	'tolv': 12,
	'tretton': 13,
	'fjorton': 14,
	'femton': 15,
	'sexton': 16,
	'sjutton': 17,
	'arton': 18,
	'nitton': 19
};

/**
 * The words for the whole tens, which also start every number between them.
 */
const TENS: Readonly<Record<string, number>> = {
	'tjugo': 20,
	'trettio': 30,
	'fyrtio': 40,
	'femtio': 50,
	'sextio': 60,
	'sjuttio': 70,
	'åttio': 80,
	'nittio': 90
};

/**
 * The words for the first ten positions.
 */
const ORDINAL_ONES: Readonly<Record<string, number>> = {
	'första': 1,
	'andra': 2,
	'tredje': 3,
	'fjärde': 4,
	'femte': 5,
	'sjätte': 6,
	'sjunde': 7,
	'åttonde': 8,
	'nionde': 9
};

/**
 * The words for the positions 10 to 19.
 */
const ORDINAL_TEENS: Readonly<Record<string, number>> = {
	'tionde': 10,
	'elfte': 11,
	'tolfte': 12,
	'trettonde': 13,
	'fjortonde': 14,
	'femtonde': 15,
	'sextonde': 16,
	'sjuttonde': 17,
	'artonde': 18,
	'nittonde': 19
};

/**
 * The words for the whole tens as positions.
 */
const ORDINAL_TENS: Readonly<Record<string, number>> = {
	'tjugonde': 20,
	'trettionde': 30,
	'fyrtionde': 40,
	'femtionde': 50,
	'sextionde': 60,
	'sjuttionde': 70,
	'åttionde': 80,
	'nittionde': 90
};

/**
 * Build the words for every number from 0 to 99 by putting the word for the
 * ones after the word for the tens, as in `tjugo` and `ett` for `tjugoett`.
 *
 * A number always starts with the plain word for the tens, so the positions
 * are built from the same {@link TENS} as the counts and only the ending
 * differs: `tjugoförsta` is `tjugo` and `första`.
 *
 * @param ones -
 *   the words that end a number
 * @param wholeTens -
 *   the words for the whole tens, used when nothing follows them
 * @param teens -
 *   the words for 10 to 19
 * @returns
 *   every word from 0 to 99 mapped to its number
 */
function buildWords(
	ones: Readonly<Record<string, number>>,
	wholeTens: Readonly<Record<string, number>>,
	teens: Readonly<Record<string, number>>
): Record<string, number> {
	const result: Record<string, number> = { ...ones, ...teens, ...wholeTens };

	for(const [ tensWord, tensValue ] of Object.entries(TENS)) {
		for(const [ onesWord, onesValue ] of Object.entries(ones)) {
			if(onesValue === 0) continue;

			result[tensWord + onesWord] = tensValue + onesValue;
		}
	}

	return result;
}

/**
 * The words for the numbers 0 to 99.
 */
export const CARDINAL_WORDS: Readonly<Record<string, number>> = buildWords(ONES, TENS, TEENS);

/**
 * The words for the positions 1 to 99.
 */
export const ORDINAL_WORDS: Readonly<Record<string, number>> = buildWords(
	ORDINAL_ONES,
	ORDINAL_TENS,
	ORDINAL_TEENS
);

/**
 * The words that multiply the number in front of them, such as `tusen` in
 * `två tusen`. The hundreds are written as a single word in Swedish, so
 * `tvåhundra` is here as well.
 */
export const MULTIPLIER_WORDS: Readonly<Record<string, number>> = {
	'dussin': 12,

	'hundra': 100,
	'tusen': 1000,
	'miljon': 1000000,
	'miljoner': 1000000,
	'miljard': 1000000000,
	'miljarder': 1000000000,

	'K': 1000,
	'M': 1000000,

	...Object.fromEntries(
		Object.entries(ONES)
			.filter(([ , value ]) => value > 0)
			.map(([ word, value ]) => [ word + 'hundra', value * 100 ])
	)
};
