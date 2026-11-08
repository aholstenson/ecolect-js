import type { Tokenizer } from '../../tokenization/index.js';
import { tokenize } from '../../tokenization/index.js';
import { characters } from '../algorithms/jaroWinkler.js';

import { swedishStemmer } from './algorithms/swedishStemmer.js';
import { CARDINAL_WORDS, TENS_WORDS } from './numberWords.js';

/**
 * Words that are short enough that a misspelling of them is more likely to
 * be a different word than the same one.
 */
const SHORT_WORD_LENGTH = 4;

/**
 * Tokenizer for Swedish. Swedish writes compounds as a single word and has
 * no contractions to split, so the words the shared tokenizer finds are kept
 * as they are and only normalized and stemmed.
 *
 * @param value -
 *   the text to tokenize
 * @returns
 *   the tokens found in the text
 */
export const tokenizer: Tokenizer = (value: string) => {
	return tokenize(value, input => {
		const word = input.raw;
		const normalized = normalize(word);

		return [
			{
				raw: word,
				normalized: normalized,
				short: characters(word).length <= SHORT_WORD_LENGTH,
				stemmed: NOT_STEMMED.has(normalized) ? normalized : swedishStemmer(normalized),
				skippable: SKIPPABLE.has(normalized)
			}
		];
	});
};

/**
 * Normalize a word so that words that mean the same thing are read as the
 * same token.
 *
 * @param word -
 *   the word to normalize
 * @returns
 *   the normalized word
 */
function normalize(word: string): string {
	const lcWord = word.toLocaleLowerCase('sv');

	switch(lcWord) {
		case '&':
			return 'och';
		default:
			return lcWord;
	}
}

/**
 * Words that are kept as they are instead of being stemmed. The stemmer
 * removes the ending `en` as in `bilen`, which makes `tjugoen` the same word
 * as `tjugo`, so the words for numbers are not stemmed.
 */
const NOT_STEMMED = new Set([
	...Object.keys(CARDINAL_WORDS),
	...Object.keys(TENS_WORDS)
]);

/**
 * Normalized tokens that can be skipped if they are missing in the input.
 */
const SKIPPABLE = new Set([
	'i', 'på', 'för', 'en', 'ett', 'den', 'det', 'de', 'till'
]);
