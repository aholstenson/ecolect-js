import {
	punctuation,
	wordish,
	numeric,
	emoji,
	emojiModifier
} from './matchers';

const MATCHER_PUNCTUATION = new RegExp('^(' + punctuation + ')+$');
function isPunctuation(text) {
	return MATCHER_PUNCTUATION.test(text);
}

const MATCHER_ALPHABETIC = '(?:' + wordish + ')+';
const MATCHER_NUMERIC = '(?:' + numeric + ')+';
const MATCHER_EMOJI = emoji + '(?:' + emojiModifier + ')*';
const MATCHER = new RegExp('(' + MATCHER_ALPHABETIC + '|' + MATCHER_NUMERIC + '|' + MATCHER_EMOJI + '|.)', 'gu');
function tokenizeSingle(index, text, transformer, result) {
	MATCHER.previousIndex = 0;
	let match;
	while((match = MATCHER.exec(text))) {
		const offset = match.index;
		const raw = match[0];

		let offsetStart = index + offset;
		const token = {
			start: offsetStart,
			stop: offsetStart + raw.length,
			raw: raw
		};

		let tokens = transformer(token);
		if(Array.isArray(tokens)) {
			for(let i=0; i<tokens.length; i++) {
				const t = tokens[i];
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
		} else {
			if(isPunctuation(tokens.raw)) {
				tokens.punctuation = true;
			}

			result.push(tokens);
		}
	}
}

/**
 * Tokenize the input on white space and special characters. This should be
 * useful for many languages, but is probably not the right strategy for every
 * language in use.
 */
export function tokenize(text, transformer) {

	// First step is to normalize the input to NFC if we can
	if(text.normalize) {
		text = text.normalize();
	}

	let result = makeTokens([]);

	const NON_SPACE = /\S+/gu;
	let match;
	while((match = NON_SPACE.exec(text))) {
		const index = match.index;
		const raw = match[0];

		tokenizeSingle(index, raw, transformer, result);
	}

	return result;
}

function raw() {
	if(this.length === 0) return '';

	let result = [];
	let index = this[0].start;
	for(let i=0; i<this.length; i++) {
		const token = this[i];

		for(let j=index; j<token.start; j++) {
			result.push(' ');
		}
		index = token.stop;

		result.push(token.raw);
	}

	return result.join('');
}

const slice = function() {
	const array = Array.prototype.slice.apply(this, arguments);
	return makeTokens(array);
};

function makeTokens(array) {
	array.raw = raw;
	array.slice = slice;
	return array;
}
