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
 * and the apostrophe. A run of these is one word. The apostrophe is the
 * straight `'` or the curly `’` (U+2019) that phones and word processors type.
 */
const MATCHER_ALPHABETIC = '[\\p{Alphabetic}\\p{M}\\p{Pc}\\p{Join_Control}\'\\u2019]+';

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

/**
 * A character and the combining marks that follow it, or combining marks
 * without a character before them. NFC changes the text mostly inside such a
 * part. Scripts such as Hangul also join parts.
 */
const NORMALIZATION_PART = /\P{M}\p{M}*|\p{M}+/gu;

/**
 * Get the offset in the original text of each offset in the NFC text, so that
 * tokens refer to the text as the caller gave it.
 *
 * The text is split into groups that NFC changes one at a time. A group is a
 * part from `NORMALIZATION_PART`, or several parts if NFC joins them. An
 * offset at the start of a group is exact. An offset inside a group that NFC
 * changed is moved to the same place in the group, but never past its end.
 *
 * @param original -
 *   the text as given
 * @param normalized -
 *   the text in NFC
 * @returns
 *   the offset in the original text for each offset in the NFC text, or
 *   `null` if the two texts are the same
 */
function originalOffsets(original: string, normalized: string): number[] | null {
	if(original === normalized) return null;

	const offsets: number[] = [];
	const groups: string[] = [];

	let groupStart = 0;
	let group = '';
	let groupNormalized = '';
	const endGroup = () => {
		for(let i = 0; i < groupNormalized.length; i++) {
			offsets.push(groupStart + Math.min(i, group.length));
		}

		groups.push(groupNormalized);
	};

	for(const match of original.matchAll(NORMALIZATION_PART)) {
		const part = match[0];
		const partNormalized = part.normalize();
		const joined = (group + part).normalize();

		if(group && joined === groupNormalized + partNormalized) {
			endGroup();
			groupStart = match.index;
			group = part;
			groupNormalized = partNormalized;
		} else {
			group += part;
			groupNormalized = joined;
		}
	}

	endGroup();
	offsets.push(original.length);

	if(groups.join('') !== normalized) {
		// Use the NFC offsets, but keep them inside the original text
		return Array.from(
			{ length: normalized.length + 1 },
			(_, i) => i === normalized.length ? original.length : Math.min(i, original.length)
		);
	}

	return offsets;
}

function tokenizeSingle(index: number, original: string, tokenizer: PartialTokenizer, result: Tokens) {
	// Normalize to NFC, so that the same text gives the same tokens
	const text = original.normalize();
	const offsets = originalOffsets(original, text);
	const toOriginal = (offset: number) => index + (offsets ? offsets[offset] : offset);

	MATCHER.lastIndex = 0;
	let match;
	while((match = MATCHER.exec(text))) {
		const raw = match[0];
		let offset = match.index;

		const tokens = tokenizer({
			start: toOriginal(offset),
			stop: toOriginal(offset + raw.length),
			raw: raw
		});

		for(let i=0; i<tokens.length; i++) {
			const t = tokens[i] as Token;
			if(typeof t.start === 'undefined') {
				t.start = toOriginal(offset);
				t.stop = toOriginal(Math.min(offset + t.raw.length, text.length));
			}

			if(isPunctuation(t.raw)) {
				t.punctuation = true;
			}

			offset += t.raw.length;
			result.push(t);
		}
	}
}

/**
 * Text between white space. Control characters and invisible format
 * characters, such as the zero width space and the right-to-left mark, are
 * read as white space, because text copied from web pages and chat apps often
 * contains them. The zero width joiners and the tag characters of flags are
 * kept, because they are part of emoji and of words in some scripts.
 */
const WORD_CHUNK = /(?:[^\s\p{Cc}\p{Cf}]|[\p{Join_Control}\u{E0020}-\u{E007F}])+/gu;

/**
 * Tokenize the input on white space and special characters. This should be
 * useful for many languages, but is probably not the right strategy for every
 * language in use.
 *
 * The text of each token is in NFC, but the start and stop of each token are
 * offsets in the text as it was given.
 */
export function tokenize(text: string, tokenizer: PartialTokenizer) {
	const result = Tokens.empty();

	for(const match of text.matchAll(WORD_CHUNK)) {
		tokenizeSingle(match.index, match[0], tokenizer, result);
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
