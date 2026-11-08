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
			const normalized = normalize(word, tokens[i + 1]);

			result[i] = {
				raw: raw[i],
				normalized: normalized,
				short: word.length <= 4,
				stemmed: porterStemmer(normalized),
				skippable: SKIPPABLE.has(normalized)
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
 * Get the text of each token as it was typed. The tokens are made from text
 * with the apostrophes replaced. When the tokens together are that text, each
 * token gets the same part of the typed text, so that free text keeps the
 * apostrophes the user typed. Rules that change the text, such as for
 * quotes, give tokens that are not part of the text, and these tokens are
 * used as they are.
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
	if(typed === text || tokens.join('') !== text) {
		return tokens;
	}

	let index = 0;
	return tokens.map(token => {
		const raw = typed.substring(index, index + token.length);
		index += token.length;
		return raw;
	});
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
 * Normalized tokens that can be skipped if they are missing in the input.
 */
const SKIPPABLE = new Set([
	'in', 'at', 'for', 'a', 'an', 'the', 'by', 'to'
]);
