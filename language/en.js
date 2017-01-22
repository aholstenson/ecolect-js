'use strict';

const utils = require('./utils');

const number = require('./en/number');
const ordinal = require('./en/ordinal');

const stemmer = require('talisman/stemmers/porter');
const similarity = require('talisman/metrics/distance/jaro-winkler').similarity;
const treebank = require('talisman/tokenizers/words/treebank');

function normalize(word, next) {
	word = word.toLowerCase();

	switch(word) {
		case 'ca':
			if(next == 'n\'t') {
				return 'can';
			}
			break;
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
			return word;
	}
}

/*
 * Implementation of English. Uses stemming and a distance metric to determine
 * if a token matches or not.
 */
module.exports = {
	id: 'en',

	tokenize(string) {
		return utils.tokenize(string, input => {
			const tokens = treebank(input.raw);
			for(let i=0; i<tokens.length; i++) {
				const word = tokens[i];
				const normalized = normalize(word, tokens[i+1]);

				tokens[i] = {
					raw: word,
					normalized: normalized,
					stemmed: stemmer(normalized)
				};
			}
			return tokens;
		});
	},

	compareTokens(a, b) {
		if(a.normalized === b.normalized) return 1.0;
		if(a.stemmed === b.stemmed) return 0.95;

		const d = similarity(a.normalized, b.normalized);
		if(d > 0.9) return d * 0.9;

		return 0;
	},

	comparePartialTokens(a, b) {
		if(a.normalized.indexOf(b.normalized) === 0) return 1.0;

		const d = similarity(a.normalized.substring(0, b.normalized.length), b.normalized);
		if(d > 0.9) return d * 0.9;

		return 0;
	}
};

module.exports.number = number(module.exports);
module.exports.ordinal = ordinal(module.exports);
