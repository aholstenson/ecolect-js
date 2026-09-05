import { Tokenizer, tokenize } from '../../tokenization/index.js';

import { swedishStemmer } from './algorithms/swedishStemmer.js';

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
				short: word.length <= SHORT_WORD_LENGTH,
				stemmed: swedishStemmer(normalized),
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
 * Normalized tokens that can be skipped if they are missing in the input.
 */
const SKIPPABLE = new Set([
	'i', 'på', 'för', 'en', 'ett', 'den', 'det', 'de', 'till'
]);
