'use strict';

const utils = require('./utils');

const stemmer = require('talisman/stemmers/porter');
const similarity = require('talisman/metrics/distance/jaro-winkler').similarity;
const treebank = require('talisman/tokenizers/words/treebank');

function normalize(word) {
	word = word.toLowerCase();

	switch(word) {
		case 'n\'t':
			return 'not';
		case '\'m':
			return 'am';
		case '\'re':
			return 'are';
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
		return utils.tokenize(string, raw => {
			return treebank(raw)
				.map(word => {
					const normalized = normalize(word);

					return {
						normalized: normalized,
						stemmed: stemmer(normalized)
					}
				})

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
