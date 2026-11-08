import type { Generator } from '../generation/Generator.js';
import { PhraseGenerator, renderersFor } from '../generation/Generator.js';
import { TemplateGenerator } from '../generation/TemplateGenerator.js';
import type { TemplateSource } from '../generation/templates.js';
import { searchTemplates } from '../generation/templates.js';
import type {
	Match as GraphMatch,
	Graph,
	Encounter,
	GraphBuildable
} from '../graph/index.js';
import {
	GraphMatcher
} from '../graph/index.js';
import type { Language } from '../language/index.js';
import { localeAwareMatcher } from '../matching/localeOptions.js';
import type { Matcher } from '../matching/Matcher.js';
import type { Value } from '../values/base.js';

import { Phrase } from './Phrase.js';
import { ResolverParser } from './ResolverParser.js';

/**
 * Collection of phrases that can be turned into a matcher or be used to build
 * up a larger matcher.
 */
export class Phrases<Values extends object> {
	private values: Map<string, Value<any>>;
	private phrases: GraphBuildable<any>[][];
	private skippableWords: string[];

	public constructor(
		values: Map<string, Value<any>>,
		phrases: GraphBuildable<any>[][],
		skippableWords: string[] = []
	) {
		this.values = values;
		this.phrases = phrases;
		this.skippableWords = skippableWords;
	}

	/**
	 * The types of the values these phrases use, keyed by the name they are
	 * referred to by.
	 */
	public get valueTypes(): ReadonlyMap<string, Value<any>> {
		return this.values;
	}

	public toGraph(language: Language) {
		return this.createParser(language).build();
	}

	/**
	 * Get the ways these phrases can be written, for the generation of text.
	 * The phrases are read in the order they were added, and each phrase in
	 * the order it is written, so text that is as long as other text comes
	 * out in the order the phrases describe it.
	 *
	 * @param language -
	 *   the language of the phrases
	 * @returns
	 *   the ways to write the phrases
	 */
	public toTemplates(language: Language): TemplateSource {
		return searchTemplates(this.createParser(language).build(false));
	}

	/**
	 * Create a parser with these phrases added.
	 *
	 * @param language -
	 *   the language of the phrases
	 * @returns
	 *   the parser, not yet built
	 */
	private createParser(language: Language): ResolverParser<Phrase<Values>> {
		const parser = new ResolverParser<Phrase<Values>>(language);
		parser.skippable(...this.skippableWords);

		const resultHandler = (values: any, options: any, encounter: Encounter) => {
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

		return parser;
	}

	public toMatcher(language: Language): Matcher<Phrase<Values>> {
		return toMatcher(language, this.toGraph(language));
	}

	/**
	 * Create a generator that writes the text these phrases would match a set
	 * of values from. This is the other direction of a matcher, and is what
	 * turns values that were stored, such as in a link, back into something a
	 * person can read.
	 *
	 * @param language -
	 *   the language to write the text in
	 * @returns
	 *   generator for these phrases
	 */
	public toGenerator(language: Language): Generator<Values> {
		const graph = this.toGraph(language);
		const matcher = toMatcher(language, graph);

		return new PhraseGenerator<Values>(new TemplateGenerator(
			language,
			this.toTemplates(language),
			renderersFor(this.values, language),
			async (text, options) => {
				const match = await matcher.match(text, options);
				return match ? match.values : null;
			}
		));
	}
}

/**
 * Create the matcher for a graph of phrases.
 *
 * @param language -
 *   the language of the phrases
 * @param graph -
 *   the graph to match against
 * @returns
 *   the matcher
 */
function toMatcher<Values extends object>(
	language: Language,
	graph: Graph<Phrase<Values>>
): Matcher<Phrase<Values>> {
	return localeAwareMatcher(language, new GraphMatcher(graph, {
		mapper: finalizeMatch
	}));
}

function finalizeMatch<V extends object>(
	result: GraphMatch<Phrase<V>>,
	options: any,
	encounter: Encounter
): Phrase<V> {
	const phrase = new Phrase<any>();
	phrase.score = result.score;
	phrase.values = result.data.values;
	phrase.expression = result.data.expression;
	phrase.refreshExpression();
	return phrase;
}
