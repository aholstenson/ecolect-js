import {
	punctuation,
	wordish,
	numeric,
	emoji,
	emojiModifier
} from '../matchers';

import { TokenData } from './TokenData';
import { Token } from './Token';
import { Tokenizer } from './Tokenizer';
import { Tokens } from './Tokens';

const MATCHER_PUNCTUATION = new RegExp('^(' + punctuation + ')+$');
function isPunctuation(text: string) {
	return MATCHER_PUNCTUATION.test(text);
}

const MATCHER_ALPHABETIC = '(?:' + wordish + ')+';
const MATCHER_NUMERIC = '(?:' + numeric + ')+';
const MATCHER_EMOJI = emoji + '(?:' + emojiModifier + ')*';
const MATCHER = new RegExp('(' + MATCHER_ALPHABETIC + '|' + MATCHER_NUMERIC + '|' + MATCHER_EMOJI + '|.)', 'gu');
function tokenizeSingle(index: number, text: string, tokenizer: Tokenizer<TokenData>, result: Tokens) {
	MATCHER.lastIndex = 0;
	let match;
	while((match = MATCHER.exec(text))) {
		const offset = match.index;
		const raw = match[0];

		let offsetStart = index + offset;

		const tokens = tokenizer({
			start: offsetStart,
			stop: offsetStart + raw.length,
			raw: raw
		});

		for(let i=0; i<tokens.length; i++) {
			const t = tokens[i] as Token;
			if(typeof t.start === 'undefined') {
				t.start = offsetStart;
				t.stop = offsetStart + t.raw.length;
			}

			if(isPunctuation(t.raw)) {
				t.punctuation = true;
			}

			offsetStart = t.stop;
			result.push(t);
		}
	}
}

/**
 * Tokenize the input on white space and special characters. This should be
 * useful for many languages, but is probably not the right strategy for every
 * language in use.
 */
export function tokenize(text: string, tokenizer: Tokenizer<TokenData>) {

	// First step is to normalize the input to NFC if we can
	if(text.normalize) {
		text = text.normalize();
	}

	const result = Tokens.empty();

	const NON_SPACE = /\S+/gu;
	let match;
	while((match = NON_SPACE.exec(text))) {
		const index = match.index;
		const raw = match[0];

		tokenizeSingle(index, raw, tokenizer, result);
	}

	return result;
}
