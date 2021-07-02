import {
	punctuation,
	wordish,
	numeric,
	emoji,
	emojiModifier
} from './matchers';
import { Token } from './Token';
import { TokenData } from './TokenData';
import { Tokens } from './Tokens';

const MATCHER_PUNCTUATION = new RegExp('^(' + punctuation + ')+$');
function isPunctuation(text: string) {
	return MATCHER_PUNCTUATION.test(text);
}

const MATCHER_ALPHABETIC = '(?:' + wordish + ')+';
const MATCHER_NUMERIC = '(?:' + numeric + ')+';
const MATCHER_EMOJI = emoji + '(?:' + emojiModifier + ')*';
const MATCHER = new RegExp('(' + MATCHER_ALPHABETIC + '|' + MATCHER_NUMERIC + '|' + MATCHER_EMOJI + '|.)', 'gu');
function tokenizeSingle(index: number, text: string, tokenizer: PartialTokenizer, result: Tokens) {
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
export function tokenize(text: string, tokenizer: PartialTokenizer) {

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


/**
 * Input as given to a tokenizer.
 */
export interface TokenizerInput {
	/**
	 * The raw text to tokenize.
	 */
	raw: string;

	/**
	 * The index in the source at which the first character in the raw text
	 * was pulled from.
	 */
	start: number;

	/**
	 * The index in the source at which the last character in the raw text
	 * was pulled from.
	 */
	stop: number;
}

/**
 * Tokenizer of input. A tokenizer is responsible for creating tokens, either
 * full ones or simple token data.
 */
export type PartialTokenizer = (input: TokenizerInput) => TokenData[];
