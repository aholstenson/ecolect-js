'use strict';

const utils = require('./utils');

//const dateLocale = require('date-fns/locale/en');

const integer = require('./en/integer');
const number = require('./en/number');
const ordinal = require('./en/ordinal');
const boolean = require('./en/boolean');
const temperature = require('./en/temperature');

const dayOfWeek = require('./en/dayOfWeek');
const month = require('./en/month');
const year = require('./en/year');
const date = require('./en/date');
const time = require('./en/time');
const datetime = require('./en/datetime');

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
			return word;
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

/**
 * Normalized tokens that can be skipped if they are missing in the input.
 */
const SKIPPABLE = [
	'in', 'at', 'for', 'a', 'an'
];

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
					short: word.length <= 4,
					stemmed: stemmer(normalized),
					skippable: SKIPPABLE.indexOf(normalized) >= 0
				};
			}
			return tokens;
		});
	},

	compareTokens(a, b) {
		if(a.normalized === b.normalized) return 1.0;

		if(a.stemmed === b.stemmed) return 0.95;

		if(a.short || b.short) return 0;

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

module.exports.integer = integer(module.exports);
module.exports.number = number(module.exports);
module.exports.ordinal = ordinal(module.exports);
module.exports.boolean = boolean(module.exports);

module.exports.dayOfWeek = dayOfWeek(module.exports);
module.exports.month = month(module.exports);
module.exports.year = year(module.exports);
module.exports.date = date(module.exports);
module.exports.time = time(module.exports);
module.exports.datetime = datetime(module.exports);

module.exports.temperature = temperature(module.exports);
