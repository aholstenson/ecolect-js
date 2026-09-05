import { tokenize } from './tokenize.js';
import { Tokenizer } from './Tokenizer.js';

export const whitespaceTokenizer: Tokenizer = input => {
	return tokenize(input, tokens => {
		return [
			{
				raw: tokens.raw,
				normalized: tokens.raw.toLowerCase(),
				short: tokens.raw.length < 4,
				stemmed: tokens.raw,
				skippable: false
			}
		];
	});
};
