import { tokenize } from './tokenize';
import { Tokenizer } from './Tokenizer';

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
