'use strict';

const matchers = require('./matchers');

const MATCHER_PUNCTUATION = new RegExp('^(' + matchers.punctuation + ')+$');
function isPunctuation(text) {
	return MATCHER_PUNCTUATION.test(text);
}

const MATCHER_ALPHABETIC = '(?:' + matchers.wordish + ')+';
const MATCHER_NUMERIC = '(?:' + matchers.numeric + ')+';
const MATCHER_EMOJI = matchers.emoji + '(?:' + matchers.emojiModifier + ')*';
const MATCHER = new RegExp('(' + MATCHER_ALPHABETIC + '|' + MATCHER_NUMERIC + '|' + MATCHER_EMOJI + '|.)', 'gu');
function tokenizeSingle(index, text, transformer, result) {

	function pushToken(offset, raw) {
		let offsetStart = index + offset;
		const token = {
			start: offsetStart,
			stop: offsetStart + raw.length,
			raw: raw
		};

		let tokens = transformer(token);
		if(Array.isArray(tokens)) {
			tokens.forEach(t => {
				if(typeof t.start === 'undefined') {
					t.start = offsetStart;
					t.stop = offsetStart + t.raw.length;
				}

				if(isPunctuation(t.raw)) {
					t.punctuation = true;
				}

				offsetStart = t.stop;
				result.push(t);
			});
		} else {
			if(isPunctuation(tokens.raw)) {
				tokens.punctuation = true;
			}

			result.push(tokens);
		}
	}

	MATCHER.previousIndex = 0;
	let match;
	while((match = MATCHER.exec(text))) {
		const offset = match.index;
		const raw = match[0];

		pushToken(offset, raw);
	}
}

/**
 * Tokenize the input on white space and special characters. This should be
 * useful for many languages, but is probably not the right strategy for every
 * language in use.
 */
module.exports.tokenize = function(text, transformer) {

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
};

module.exports.raw = function(tokens) {
	let result = [];
	let index = tokens[0].start;
	for(let i=0; i<tokens.length; i++) {
		const token = tokens[i];

		for(let j=index; j<token.start; j++) {
			result.push(' ');
		}
		index = token.stop;

		result.push(token.raw);
	}

	return result.join('');
};


function makeTokens(array) {
	array.raw = function() {
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
	};

	array.slice = function() {
		const array = Array.prototype.slice.apply(this, arguments);
		return makeTokens(array);
	};

	return array;
}
