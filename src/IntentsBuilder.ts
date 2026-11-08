import { deepEqual } from 'fast-equals';

import type { IntentGenerator } from './generation/Generator.js';
import { IntentsGenerator, renderersFor } from './generation/Generator.js';
import { templatesFrom } from './generation/templates.js';
import { TemplateGenerator } from './generation/TemplateGenerator.js';
import type { Graph } from './graph/index.js';
import { GraphBuilder, GraphMatcher, rebaseData } from './graph/index.js';
import type { Language } from './language/index.js';
import type { Matcher } from './matching/index.js';
import { localeAwareMatcher } from './matching/index.js';
import { Phrase } from './resolver/Phrase.js';
import type { Phrases } from './resolver/Phrases.js';

/**
 * Check if two intents are the same suggestion. Intents that have the same
 * identifier and the same values mean the same thing to the caller, even if
 * they matched different words, so only the best scoring one is kept.
 *
 * @param a -
 *   the first intent
 * @param b -
 *   the second intent
 * @returns
 *   `true` if the intents are the same suggestion
 */
function intentIsEqual(a: Intent<any, any>, b: Intent<any, any>): boolean {
	return a.id === b.id && deepEqual(a.values, b.values);
}

export class IntentsBuilder<Intents extends Intent<any, any> = never> {
	private language: Language;
	private builder: GraphBuilder<Intent<any, any>>;
	private intents: { id: string; phrases: Phrases<any>; graph: Graph<Phrase<any>> }[];

	public constructor(language: Language) {
		if(! language) {
			throw new Error('Language instance must be provided');
		}

		this.language = language;
		this.intents = [];

		this.builder = new GraphBuilder<Intent<any, any>>(language)
			.allowPartial()
			.matchIsEqual(options => options.partial || options.all ? intentIsEqual : deepEqual);
	}

	public add<I extends string, V extends object>(
		id: I,
		phrases: Phrases<V>
	): IntentsBuilder<Intents | Intent<I, V>>
	{
		if(typeof id !== 'string') {
			throw new Error('Intents require identifiers that are strings');
		}

		if(this.intents.some(intent => intent.id === id)) {
			throw new Error('Intent `' + id + '` has already been added, every intent needs its own identifier');
		}

		const graph = phrases.toGraph(this.language);
		this.intents.push({ id: id, phrases: phrases, graph: graph });

		this.builder.add(graph, v => new Intent(id, v[0]));

		return this as any;
	}

	public build(): Matcher<Intents> {
		const graph = this.builder.build();
		return localeAwareMatcher(this.language, new GraphMatcher(graph, {
			mapper: m => {
				m.data.score = m.score;
				m.data.refreshExpression();
				return m.data;
			}
		})) as any;
	}

	/**
	 * Create a generator that writes the text an intent and its values would
	 * be matched from. This is the other direction of a matcher, and is what
	 * turns an intent that was stored, such as in a link, back into something
	 * a person can read.
	 *
	 * Text is only returned when reading it back gives the intent it was
	 * written for, so a phrase that another intent matches better is never
	 * returned.
	 *
	 * @returns
	 *   generator for these intents
	 */
	public buildGenerator(): IntentGenerator<Intents> {
		const matcher = this.build();
		const generators = new Map<string, TemplateGenerator>();

		for(const intent of this.intents) {
			generators.set(intent.id, new TemplateGenerator(
				this.language,
				templatesFrom(intent.graph),
				renderersFor(intent.phrases.valueTypes, this.language),
				async (text, options) => {
					const match = await matcher.match(text, options) as Intent<any, any> | null;
					return match && match.id === intent.id ? match.values : null;
				}
			));
		}

		return new IntentsGenerator<Intents>(generators);
	}
}

export class Intent<K extends string, V extends object> extends Phrase<V> {
	public readonly id: K;

	public constructor(id: K, phrase: Phrase<V>) {
		super();

		this.id = id;
		this.score = phrase.score;
		this.expression = phrase.expression;
		this.values = phrase.values;
	}

	/**
	 * The expression of an intent comes from the phrase it matched, and not
	 * from the path through the graph of intents, so every path gives the
	 * same intent.
	 *
	 * @returns
	 *   this intent
	 */
	public [rebaseData](): this {
		return this;
	}
}
