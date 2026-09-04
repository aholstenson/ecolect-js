import { Tokenizer, tokenize } from '@ecolect/tokenization';

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
		const tokens: string[] = treebankTokenizer(input.raw);
		const result = [];
		for(let i = 0; i < tokens.length; i++) {
			const word = tokens[i];
			const normalized = normalize(word, tokens[i + 1]);

			result[i] = {
				raw: word,
				normalized: normalized,
				short: word.length <= 4,
				stemmed: porterStemmer(normalized),
				skippable: SKIPPABLE.has(normalized)
			};
		}
		return result;
	});
};

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
