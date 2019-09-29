import { tokenize } from '../tokens/tokenize';

import stemmer from 'talisman/stemmers/porter';
import { similarity } from 'talisman/metrics/distance/jaro-winkler';
import treebank from 'talisman/tokenizers/words/treebank';

import { Matcher } from '../../graph/matching';
import { GraphBuilder } from '../../graph/GraphBuilder';

import { AbstractLanguage } from '../abstract-language';
import { Token } from '../tokens';
import { integerMatcher } from './integer';
import { numberMatcher } from './number';
import { ordinalMatcher } from './ordinal';
import { booleanMatcher } from './boolean';
import { dayOfWeekMatcher } from './day-of-week';
import { yearMatcher } from './year';
import { quarterMatcher } from './quarter';
import { monthMatcher } from './month';
import { weekMatcher } from './week';
import { dateDurationMatcher } from './date-duration';
import { dateMatcher } from './date';
import { timeDurationMatcher } from './time-duration';
import { timeMatcher } from './time';
import { dateTimeDurationMatcher } from './date-time-duration';
import { dateTimeMatcher } from './date-time';
import { dateIntervalMatcher } from './date-interval';
import { createRepeating } from './repeating';

function normalize(word: string, next?: string) {
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
const SKIPPABLE = new Set([
	'in', 'at', 'for', 'a', 'an', 'the', 'by', 'to'
]);

/*
 * Implementation of English. Uses stemming and a distance metric to determine
 * if a token matches or not.
 */
export class EnglishLanguage extends AbstractLanguage {
	public readonly id = 'en';

	public tokenize(string: string) {
		return tokenize(string, input => {
			const tokens: string[] = treebank(input.raw);
			const result = [];
			for(let i=0; i<tokens.length; i++) {
				const word = tokens[i];
				const normalized = normalize(word, tokens[i+1]);

				result[i] = {
					raw: word,
					normalized: normalized,
					short: word.length <= 4,
					stemmed: stemmer(normalized),
					skippable: SKIPPABLE.has(normalized)
				};
			}
			return result;
		});
	}

	public compareTokens(a: Token, b: Token) {
		if(a.normalized === b.normalized) return 1.0;

		if(a.stemmed === b.stemmed) return 0.95;

		if(a.short || b.short) return 0;

		const d = similarity(a.normalized, b.normalized);
		if(d > 0.9) return d * 0.9;

		return 0;
	}

	public comparePartialTokens(a: Token, b: Token) {
		if(a.normalized.indexOf(b.normalized) === 0) return 1.0;

		const d = similarity(a.normalized.substring(0, b.normalized.length), b.normalized);
		if(d > 0.9) return d * 0.9;

		return 0;
	}

	public repeating<V>(matcher: Matcher<V>): GraphBuilder<V[]> {
		return createRepeating<V>(this)(matcher);
	}
}

export const en = new EnglishLanguage();
en.matcher(integerMatcher);
en.matcher(numberMatcher);
en.matcher(ordinalMatcher);
en.matcher(booleanMatcher);

en.matcher(dayOfWeekMatcher);
en.matcher(yearMatcher);
en.matcher(quarterMatcher);
en.matcher(monthMatcher);
en.matcher(weekMatcher);
en.matcher(dateDurationMatcher);
en.matcher(dateMatcher);

en.matcher(timeDurationMatcher);
en.matcher(timeMatcher);

en.matcher(dateTimeDurationMatcher);
en.matcher(dateTimeMatcher);

en.matcher(dateIntervalMatcher);

//language.temperature = temperature(language);

//language.repeating = repeating(language);
