import type { Tokenizer } from '../../tokenization/index.js';
import { tokenize } from '../../tokenization/index.js';
import { characters } from '../algorithms/jaroWinkler.js';

import { swedishStemmer } from './algorithms/swedishStemmer.js';
import { CARDINAL_WORDS, splitNumberWord, TENS_WORDS } from './numberWords.js';

/**
 * Words that are short enough that a misspelling of them is more likely to
 * be a different word than the same one.
 */
const SHORT_WORD_LENGTH = 4;

/**
 * Tokenizer for Swedish. Swedish writes compounds as a single word and has
 * no contractions to split, so the words the shared tokenizer finds are kept
 * as they are and only normalized and stemmed. There are two exceptions:
 *
 * - A compound number word, such as `tvåhundratjugotre`, is split into the
 *   words it is made of.
 * - An apostrophe at the start or the end of a word is a token of its own.
 *   This is a single quote, as in `'Änglar'`, or the possessive of a name
 *   that ends in `s`, as in `Lars'`. An apostrophe within a word, as in
 *   `McDonald's`, is kept.
 *
 * @param value -
 *   the text to tokenize
 * @returns
 *   the tokens found in the text
 */
export const tokenizer: Tokenizer = (value: string) => {
	return tokenize(value, input => {
		const match = QUOTED.exec(input.raw);
		if(! match || match[2] === '') {
			// Only apostrophes, such as a quote on its own
			return [ ...input.raw ].map(createQuoteToken);
		}

		const [ , before, word, after ] = match;
		return [
			...[ ...before ].map(createQuoteToken),
			...wordTokens(word),
			...[ ...after ].map(createQuoteToken)
		];
	});
};

/**
 * The apostrophes that can be typed as a single quote. Each one is a single
 * UTF-16 code unit.
 */
const APOSTROPHES = '\'‘’ʼ';

/**
 * A word with the apostrophes at its start and its end in groups of their
 * own.
 */
const QUOTED = new RegExp('^([' + APOSTROPHES + ']*)(.*?)([' + APOSTROPHES + ']*)$', 'su');

/**
 * Create the tokens for a word without apostrophes at its start or end.
 *
 * @param word -
 *   the word as it was typed
 * @returns
 *   the tokens of the word
 */
function wordTokens(word: string) {
	const normalized = normalize(word);

	const parts = splitNumberWord(normalized);
	if(parts && normalized.length === word.length) {
		/*
		 * A compound number word becomes one token for each of its words.
		 * The text of each token is the part of the word as it was typed.
		 */
		let offset = 0;
		return parts.map(part => {
			const raw = word.substring(offset, offset + part.length);
			offset += part.length;
			return createToken(raw, part.word);
		});
	}

	return [ createToken(word, normalized) ];
}

/**
 * Create the token for an apostrophe. Every kind of apostrophe is read as
 * the straight apostrophe `'`.
 *
 * @param raw -
 *   the apostrophe as it was typed
 * @returns
 *   the token
 */
function createQuoteToken(raw: string) {
	return {
		raw: raw,
		normalized: '\'',
		short: true,
		stemmed: '\'',
		skippable: false
	};
}

/**
 * Create the token for a word.
 *
 * @param raw -
 *   the word as it was typed
 * @param normalized -
 *   the normalized word
 * @returns
 *   the token
 */
function createToken(raw: string, normalized: string) {
	return {
		raw: raw,
		normalized: normalized,
		short: characters(raw).length <= SHORT_WORD_LENGTH,
		stemmed: NOT_STEMMED.has(normalized) ? normalized : swedishStemmer(normalized),
		skippable: SKIPPABLE.has(normalized)
	};
}

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
 *
 * `på` and `till` are not in the list. They are often a part of the verb, as
 * in `sätt på` (turn on), and without them a phrase can mean something
 * different. The graphs for values, such as `på fredag`, have these words in
 * their own rules.
 */
const SKIPPABLE = new Set([
	'i', 'för', 'en', 'ett', 'den', 'det', 'de'
]);
