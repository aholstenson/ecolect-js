import { tokenize } from '../tokens/tokenize';

import stemmer from 'talisman/stemmers/porter';
import { similarity } from 'talisman/metrics/distance/jaro-winkler';
import treebank from 'talisman/tokenizers/words/treebank';

import { GraphBuilder } from '../../graph/GraphBuilder';
import { Graph } from '../../graph/Graph';

import { AbstractLanguage } from '../AbstractLanguage';
import { Token } from '../tokens';
import { createRepeating } from './repeating';

import { integerGraph } from './integerGraph';
import { numberGraph } from './numberGraph';
import { ordinalGraph } from './ordinalGraph';
import { booleanGraph } from './booleanGraph';
import { dayOfWeekGraph } from './dayOfWeekGraph';
import { yearGraph } from './yearGraph';
import { quarterGraph } from './quarterGraph';
import { monthGraph } from './monthGraph';
import { weekGraph } from './weekGraph';
import { dateDurationGraph } from './dateDurationGraph';
import { dateGraph } from './dateGraph';
import { timeDurationGraph } from './timeDurationGraph';
import { timeGraph } from './timeGraph';
import { dateTimeDurationGraph } from './dateTimeDurationGraph';
import { dateTimeGraph } from './dateTimeGraph';
import { dateIntervalGraph } from './dateIntervalGraph';

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

	public repeating<V>(graph: Graph<V>): GraphBuilder<V[]> {
		return createRepeating<V>(this)(graph);
	}
}

export const en = new EnglishLanguage();
en.graph(integerGraph);
en.graph(numberGraph);
en.graph(ordinalGraph);
en.graph(booleanGraph);

en.graph(dayOfWeekGraph);
en.graph(yearGraph);
en.graph(quarterGraph);
en.graph(monthGraph);
en.graph(weekGraph);
en.graph(dateDurationGraph);
en.graph(dateGraph);

en.graph(timeDurationGraph);
en.graph(timeGraph);

en.graph(dateTimeDurationGraph);
en.graph(dateTimeGraph);

en.graph(dateIntervalGraph);
