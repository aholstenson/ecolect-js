/*
 * The Snowball stemmer for Swedish.
 *
 * Reference: https://snowballstem.org/algorithms/swedish/stemmer.html
 */

/**
 * The vowels of Swedish. `y` counts as a vowel, as it does in the Snowball
 * definition.
 */
const VOWELS = new Set([ 'a', 'e', 'i', 'o', 'u', 'y', 'ä', 'å', 'ö' ]);

/**
 * Consonants a word may end with for a trailing `s` to be a plural or
 * genitive ending rather than part of the stem.
 */
const VALID_S_ENDING = new Set([
	'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r',
	't', 'v', 'y'
]);

/**
 * The endings removed in step 1, longest first so that the first match is
 * also the longest one.
 */
const STEP1_SUFFIXES = [
	'heterna', 'hetens', 'anden', 'andes', 'andet', 'arens', 'arnas', 'ernas',
	'ornas', 'heten', 'heter', 'arna', 'erna', 'orna', 'arne', 'ande', 'aste',
	'aren', 'ades', 'erns', 'het', 'ade', 'are', 'ern', 'ens', 'ast', 'ad',
	'en', 'ar', 'er', 'or', 'as', 'es', 'at', 'a', 'e'
].sort((a, b) => b.length - a.length);

/**
 * The endings shortened in step 2. A word that ends with one of these keeps
 * the first letter of the pair and loses the second.
 */
const STEP2_SUFFIXES = [ 'dd', 'gd', 'nn', 'dt', 'gt', 'kt', 'tt' ];

/**
 * The endings rewritten in step 3, longest first. An empty replacement
 * deletes the ending.
 */
const STEP3_SUFFIXES: [ string, string ][] = [
	[ 'fullt', 'full' ],
	[ 'löst', 'lös' ],
	[ 'lig', '' ],
	[ 'els', '' ],
	[ 'ig', '' ]
];

/**
 * The shortest stem the endings may be taken from. Swedish words are short,
 * so Snowball keeps at least three letters in front of the region that is
 * stemmed.
 */
const MIN_STEM_LENGTH = 3;

/**
 * Find where R1 starts, the region the endings are taken from. R1 follows
 * the first consonant that comes after a vowel, and never starts before the
 * word has {@link MIN_STEM_LENGTH} letters.
 *
 * @param word -
 *   the word to read
 * @returns
 *   the index R1 starts at, which is the length of the word when the word
 *   has no R1
 */
function regionStart(word: string): number {
	let start = word.length;
	for(let i = 1; i < word.length; i++) {
		if(! VOWELS.has(word[i]) && VOWELS.has(word[i - 1])) {
			start = i + 1;
			break;
		}
	}

	return Math.max(start, MIN_STEM_LENGTH);
}

/**
 * Get if a word ends with the given suffix and the suffix lies inside R1.
 *
 * @param word -
 *   the word to read
 * @param region -
 *   the index R1 starts at
 * @param suffix -
 *   the suffix to look for
 * @returns
 *   `true` if the suffix can be taken off
 */
function endsWithin(word: string, region: number, suffix: string): boolean {
	return word.length - suffix.length >= region && word.endsWith(suffix);
}

/**
 * Remove the plural, definite and genitive endings of a word.
 *
 * @param word -
 *   the word to stem
 * @param region -
 *   the index R1 starts at
 * @returns
 *   the word without its ending
 */
function step1(word: string, region: number): string {
	for(const suffix of STEP1_SUFFIXES) {
		if(endsWithin(word, region, suffix)) {
			return word.substring(0, word.length - suffix.length);
		}
	}

	/*
	 * A trailing `s` is only an ending when the letter in front of it can
	 * carry one, so `hus` keeps its `s` while `dags` loses it.
	 */
	if(endsWithin(word, region, 's') && VALID_S_ENDING.has(word[word.length - 2])) {
		return word.substring(0, word.length - 1);
	}

	return word;
}

/**
 * Shorten a doubled consonant at the end of a word, as in `stadt` to `stad`.
 *
 * @param word -
 *   the word to stem
 * @param region -
 *   the index R1 starts at
 * @returns
 *   the shortened word
 */
function step2(word: string, region: number): string {
	for(const suffix of STEP2_SUFFIXES) {
		if(endsWithin(word, region, suffix)) {
			return word.substring(0, word.length - 1);
		}
	}

	return word;
}

/**
 * Remove or rewrite the endings that build adjectives and nouns from other
 * words.
 *
 * @param word -
 *   the word to stem
 * @param region -
 *   the index R1 starts at
 * @returns
 *   the word without its ending
 */
function step3(word: string, region: number): string {
	for(const [ suffix, replacement ] of STEP3_SUFFIXES) {
		if(endsWithin(word, region, suffix)) {
			return word.substring(0, word.length - suffix.length) + replacement;
		}
	}

	return word;
}

/**
 * Reduce a Swedish word to its stem, so that the forms of a word are
 * comparable. `veckor` and `veckan` both stem to `veck`.
 *
 * @param word -
 *   the word to stem, in lower case
 * @returns
 *   the stem of the word
 */
export function swedishStemmer(word: string): string {
	if(word.length <= MIN_STEM_LENGTH) return word;

	const region = regionStart(word);

	let result = step1(word, region);
	result = step2(result, region);
	result = step3(result, region);

	return result;
}
