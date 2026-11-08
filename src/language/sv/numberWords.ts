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
 * The words for the numbers 0 to 99, except the whole tens in
 * {@link TENS_WORDS}.
 */
export const CARDINAL_WORDS: Readonly<Record<string, number>> = buildWords(ONES, {}, TEENS);

/**
 * The words for the whole tens, such as `tjugo`. A smaller number can be
 * added after them, so `tjugo ett` is 21 and not the digits `201`.
 */
export const TENS_WORDS: Readonly<Record<string, number>> = TENS;

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
 * `två tusen`. A word such as `tvåhundra` is split into `två` and `hundra`
 * by the tokenizer, see {@link splitNumberWord}.
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
	'M': 1000000
};

/**
 * The scale words that Swedish writes in the same word as the numbers
 * around them, as in `tvåhundratjugotre`. Larger scales, such as `miljon`,
 * are written as words of their own.
 */
const COMPOUND_SCALES = [ 'hundra', 'tusen' ];

/**
 * The positions of the scale words, such as `hundrade` in `tvåhundrade`.
 */
export const ORDINAL_SCALE_WORDS: Readonly<Record<string, number>> = {
	'hundrade': 100,
	'tusende': 1000
};

/**
 * Sort words so that the longest word comes first. The longest part is tried
 * first, so that `sextiotusen` is `sextio` and `tusen` and not `sex`, `tio`
 * and `tusen`.
 *
 * @param words -
 *   the words to sort
 * @returns
 *   the words, longest word first
 */
function longestFirst(words: string[]): string[] {
	return words.sort((a, b) => b.length - a.length);
}

/**
 * The parts that a compound number word is made of, except for the last.
 */
const COMPOUND_PARTS = longestFirst([
	...Object.keys(CARDINAL_WORDS).filter(word => CARDINAL_WORDS[word] !== 0),
	...Object.keys(TENS_WORDS),
	...COMPOUND_SCALES
]);

/**
 * The parts that can end a compound number word. A position, such as `femte`
 * in `tvåhundrafemte`, can only be the last part.
 */
const LAST_COMPOUND_PARTS = longestFirst([
	...COMPOUND_PARTS,
	...Object.keys(ORDINAL_WORDS),
	...Object.keys(ORDINAL_SCALE_WORDS)
]);

/**
 * A word in a compound number word.
 */
export interface NumberWordPart {
	/**
	 * The word, such as `ett` or `tusen`.
	 */
	readonly word: string;

	/**
	 * The number of characters the word has in the compound. This is one
	 * less than the length of the word when a letter is left out where two
	 * words join, as the second `t` of `ett` in `ettusen`.
	 */
	readonly length: number;
}

/**
 * Get the length of a part in a compound when it is written together with
 * the scale word after it. Swedish does not write the same consonant three
 * times in a row, so `ett` and `tusen` are written `ettusen`.
 *
 * @param word -
 *   the compound
 * @param start -
 *   where the part starts in the compound
 * @param part -
 *   the part
 * @returns
 *   the shorter length of the part, or `null` if no scale word follows it
 *   with a letter left out
 */
function joinedLength(word: string, start: number, part: string): number | null {
	const last = part[part.length - 1];
	if(part.length < 2 || part[part.length - 2] !== last) return null;

	const next = start + part.length - 1;
	return COMPOUND_SCALES.some(scale => scale[0] === last && word.startsWith(scale, next))
		? part.length - 1
		: null;
}

/**
 * Split a compound number word into the words it is made of, such as
 * `tvåhundratjugotre` into `två`, `hundra` and `tjugotre`. Swedish writes the
 * numbers below a million as one word, and the words can then be read the
 * same way as `två hundra tjugotre`. The last word can be a position, so
 * `tvåhundrafemte` is `två`, `hundra` and `femte`.
 *
 * Only a word with `hundra` or `tusen` in it is split. A word below 100,
 * such as `tjugotre`, is a number word of its own.
 *
 * @param word -
 *   the normalized word
 * @returns
 *   the words of the number, or `null` if the word is not a compound number
 */
export function splitNumberWord(word: string): NumberWordPart[] | null {
	if(! COMPOUND_SCALES.some(scale => word.includes(scale))) return null;

	// The positions that are known to not start a valid split
	const failed = new Set<number>();

	const splitFrom = (start: number): NumberWordPart[] | null => {
		if(start === word.length) return [];
		if(failed.has(start)) return null;

		for(const part of LAST_COMPOUND_PARTS) {
			if(! word.startsWith(part, start)) continue;

			const end = start + part.length;
			if(end === word.length) {
				return [ { word: part, length: part.length } ];
			}

			if(! COMPOUND_PARTS.includes(part)) continue;

			const rest = splitFrom(end);
			if(rest) return [ { word: part, length: part.length }, ...rest ];
		}

		// A part with a letter left out before a scale word, as in `ettusen`
		for(const part of COMPOUND_PARTS) {
			if(! word.startsWith(part, start)) continue;

			const length = joinedLength(word, start, part);
			if(length === null) continue;

			const rest = splitFrom(start + length);
			if(rest) return [ { word: part, length: length }, ...rest ];
		}

		failed.add(start);
		return null;
	};

	const parts = splitFrom(0);
	return parts && parts.length > 1 ? parts : null;
}
