import { Language } from './language/Language';

import { GraphBuilder } from './graph/GraphBuilder';
import { GraphMatcher } from './graph/matching';

import { Matcher } from './matching';
import { Phrase } from './resolver/Phrase';
import { Phrases } from './resolver/Phrases';

export class IntentsBuilder<Intents extends Intent<any, any> = never> {
	private language: Language;
	private builder: GraphBuilder<Intent<any, any>>;

	constructor(language: Language) {
		if(! language || ! language.tokenize || ! language.compareTokens) {
			throw new Error('Language instance must be provided');
		}

		this.language = language;

		this.builder = new GraphBuilder<Intent<any, any>>(language)
			.allowPartial();
	}

	public add<I extends string, V extends object>(
		id: I,
		phrases: Phrases<V>): IntentsBuilder<Intents | Intent<I, V>>
	{
		if(typeof id !== 'string') {
			throw new Error('Intents require identifiers that are strings');
		}

		this.builder.add(phrases.toGraph(this.language), v => new Intent(id, v[0]));

		return this as any;
	}

	public build(): Matcher<Intents> {
		const graph = this.builder.build();
		return new GraphMatcher(this.language, graph, {
			mapper: m => {
				m.data.refreshExpression();
				return m.data;
			}
		}) as any;
	}
}

export class Intent<K extends string, V extends object> extends Phrase<V> {
	public readonly id: K;

	constructor(id: K, phrase: Phrase<V>) {
		super();

		this.id = id;
		this.score = phrase.score;
		this.expression = phrase.expression;
		this.values = phrase.values;
	}
}
