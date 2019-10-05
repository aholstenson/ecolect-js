import { Language } from '../language/Language';

import { GraphBuildable } from '../graph/GraphBuilder';
import { Match as GraphMatch, GraphMatcher, Encounter } from '../graph/matching';

import { Matcher } from '../matching/Matcher';
import { Value } from '../values/base';

import { ResolverParser }  from './ResolverParser';
import { Phrase } from './Phrase';

/**
 * Collection of phrases that can be turned into a matcher or be used to build
 * up a larger matcher.
 */
export class Phrases<Values extends object> {
	private values: Map<string, Value<any>>;
	private phrases: GraphBuildable<any>[][];

	constructor(
		values: Map<string, Value<any>>,
		phrases: GraphBuildable<any>[][]
	) {
		this.values = values;
		this.phrases = phrases;
	}

	public toGraph(language: Language) {
		const parser = new ResolverParser<Phrase<Values>>(language);

		const resultHandler = (values: any, encounter: Encounter) => {
			const result = new Phrase<any>();

			// Transfer any values that have been pushed by other parsers
			const data = encounter.data();
			for(let i=0; i<data.length; i++) {
				const value = data[i];
				if(value.id && typeof value.value !== 'undefined') {
					result.values[value.id] = value.value;
				}
			}

			// TODO: Only build expression if match is accepted

			// Build information about the matching expression
			result.updateExpression(encounter);

			return result;
		};

		for(const [ id, type ] of this.values) {
			parser.value(id, type);
		}

		for(const phrase of this.phrases) {
			parser.add(phrase, resultHandler);
		}

		return parser.build();
	}

	public toMatcher(language: Language): Matcher<Phrase<Values> | null> {
		return new GraphMatcher(language, this.toGraph(language), {
			mapper: finalizeMatch
		});
	}
}

function finalizeMatch<V extends object>(result: GraphMatch<Phrase<V>>): Phrase<V> {
	result.data.score = result.score;
	result.data.refreshExpression();
	return result.data;
}
