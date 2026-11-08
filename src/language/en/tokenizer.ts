import type { Tokenizer } from '../../tokenization/index.js';
import { tokenize } from '../../tokenization/index.js';

import { porterStemmer } from './algorithms/porterStemmer.js';
import { treebankTokenizer } from './algorithms/treebankTokenizer.js';

/**
 * Tokenizer for English.
 *
 * @param value -
 * @returns
 */
export const tokenizer: Tokenizer = (value: string) => {
	return tokenize(value, input => {
		/*
		 * The rules for contractions such as `don't` use the straight
		 * apostrophe, so the curly apostrophe is read as one.
		 */
		const text = input.raw.replace(APOSTROPHES, '\'');
		const tokens: string[] = treebankTokenizer(text);
		const raw = typedText(input.raw, text, tokens);

		const result = [];
		for(let i = 0; i < tokens.length; i++) {
			const word = tokens[i];
			const normalized = DOUBLE_QUOTES.has(raw[i]) ? '"' : normalize(word, tokens[i + 1]);

			result[i] = {
				raw: raw[i],
				normalized: normalized,
				short: word.length <= 4,
				stemmed: NOT_STEMMED.has(normalized) ? normalized : porterStemmer(normalized),
				skippable: SKIPPABLE.has(normalized) || word.toLowerCase() === '\'s'
			};
		}
		return result;
	});
};

/**
 * Apostrophes that are read as the straight apostrophe `'`. Each one is a
 * single UTF-16 code unit, so the text keeps its length when they are
 * replaced.
 */
const APOSTROPHES = /[\u2019\u02BC]/g;

/**
 * Double quotes that are read as the straight double quote `"`, so that a
 * phrase with `"` matches the curly quotes that phones type.
 */
const DOUBLE_QUOTES = new Set([ '"', '\u201C', '\u201D' ]);

/**
 * Tokens that the rules make from a double quote `"`.
 */
const QUOTE_TOKENS = new Set([ '``', '\'\'' ]);

/**
 * Get the text of each token as it was typed, so that free text keeps what
 * the user typed and each token has the length of its part of the input.
 * The tokens are made from text with the apostrophes replaced, and the rules
 * change a double quote `"` into ` `` ` or `''`. Each token gets the part of
 * the typed text that it was made from. If the tokens can not be matched to
 * the typed text, the tokens are used as they are.
 *
 * @param typed -
 *   the text as it was typed
 * @param text -
 *   the text the tokens were made from
 * @param tokens -
 *   the tokens made from the text
 * @returns
 *   the typed text of each token
 */
function typedText(typed: string, text: string, tokens: string[]): string[] {
	const result: string[] = [];
	let index = 0;
	for(const token of tokens) {
		if(QUOTE_TOKENS.has(token) && text[index] === '"') {
			result.push('"');
			index += 1;
		} else if(text.startsWith(token, index)) {
			result.push(typed.substring(index, index + token.length));
			index += token.length;
		} else {
			return tokens;
		}
	}

	return index === text.length ? result : tokens;
}

function normalize(word: string, next?: string) {
	const lcWord = word.toLocaleLowerCase('en');

	switch(lcWord) {
		case 'ca':
			if(next === 'n\'t') {
				return 'can';
			}
			return word;
		case 'n\'t':
			return 'not';
		case '\'m':
			return 'am';
		case '\'re':
			return 'are';
		case '\'ll':
			return 'will';
		case '\'s':
			return 'is';
		case '\'ve':
			return 'have';
		case '&':
			return 'and';
		default:
			return lcWord;
	}
}

/**
 * Words that look like a form of another word, but have their own meaning.
 * The stemmer would read `news` as the plural of `new`, so these words are
 * not stemmed.
 */
const NOT_STEMMED = new Set([
	'news'
]);

/**
 * Normalized tokens that can be skipped if they are missing in the input.
 * The token `'s` can also be skipped. It is read as `is`, as in `what's`,
 * but it can also be a possessive, as in `John's`, which a phrase often
 * leaves out.
 */
const SKIPPABLE = new Set([
	'in', 'at', 'for', 'a', 'an', 'the', 'by', 'to'
]);
