import { tokenize } from '../utils';

import integer from './integer';
import number from './number';
import ordinal from './ordinal';
import boolean from './boolean';
import temperature from './temperature';

import dayOfWeek from './dayOfWeek';
import year from './year';
import quarter from './quarter';
import week from './week';
import month from './month';

import dateDuration from './date-duration';
import date from './date';

import timeDuration from './time-duration';
import time from './time';

import dateTimeDuration from './date-time-duration';
import dateTime from './date-time';

import dateInterval from './date-interval';

import stemmer from 'talisman/stemmers/porter';
import { similarity } from 'talisman/metrics/distance/jaro-winkler';
import treebank from 'talisman/tokenizers/words/treebank';

function normalize(word, next) {
	word = word.toLowerCase();

	switch(word) {
		case 'ca':
			if(next === 'n\'t') {
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
const language = {
	id: 'en',

	tokenize(string) {
		return tokenize(string, input => {
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

language.integer = integer(language);
language.number = number(language);
language.ordinal = ordinal(language);
language.boolean = boolean(language);

language.dayOfWeek = dayOfWeek(language);
language.year = year(language);
language.quarter = quarter(language);
language.month = month(language);
language.week = week(language);
language.dateDuration = dateDuration(language);
language.date = date(language);

language.timeDuration = timeDuration(language);
language.time = time(language);

language.dateTimeDuration = dateTimeDuration(language);
language.dateTime = dateTime(language);

language.dateInterval = dateInterval(language);

language.temperature = temperature(language);

export default language;
