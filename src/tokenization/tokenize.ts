import type { Token } from './Token.js';
import type { TokenData } from './TokenData.js';
import { Tokens } from './Tokens.js';

/*
 * The character classes use Unicode property escapes. The JavaScript engine
 * supplies the Unicode data, so the classes follow the Unicode version of the
 * runtime. All of them work with the `u` flag, which every engine that runs
 * ES2022 supports.
 */

const MATCHER_PUNCTUATION = /^\p{P}+$/u;
function isPunctuation(text: string) {
	return MATCHER_PUNCTUATION.test(text);
}

/**
 * Letters, combining marks, connectors such as `_`, the zero width joiners
 * and the apostrophe. A run of these is one word.
 */
const MATCHER_ALPHABETIC = '[\\p{Alphabetic}\\p{M}\\p{Pc}\\p{Join_Control}\']+';

const MATCHER_NUMERIC = '\\p{Nd}+';

/**
 * The parts that can follow an emoji in the same sequence: a skin tone, the
 * emoji presentation selector and the tag characters of subdivision flags.
 */
const EMOJI_SUFFIX = '[\\p{Emoji_Modifier}\\uFE0F\\u{E0020}-\\u{E007F}]*';
const EMOJI_PART = '\\p{Extended_Pictographic}' + EMOJI_SUFFIX;

/**
 * One emoji as the user sees it. This is a flag made from two regional
 * indicators, or emoji parts with zero width joiners between them.
 */
const MATCHER_EMOJI = '\\p{Regional_Indicator}{2}|' + EMOJI_PART + '(?:\\u200D' + EMOJI_PART + ')*';

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
