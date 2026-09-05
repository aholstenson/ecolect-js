import { Graph, GraphBuilder } from '@ecolect/graph';
import { TokenComparer, Tokenizer } from '@ecolect/tokenization';

import { KnownGraphs, KnownGraphsDataTypes } from './KnownGraphs.js';
import { Language } from './Language.js';
import { LanguageGraphFactory } from './LanguageGraphFactory.js';
import { Vocabulary } from './Vocabulary.js';
import { createVocabularyTokenizer } from './vocabularyTokenizer.js';

/**
 * Factory that creates the builder used to repeat a value in a language.
 */
export type RepeatingFactory = <V>(language: Language, graph: Graph<V>) => GraphBuilder<V[]>;

/**
 * Abstract implementation of Language. This is the root that languages should
 * extend.
 */
export abstract class AbstractLanguage implements Language {
	private readonly cachedGraphs: Map<string, Graph<any>> = new Map();
	private readonly graphFactories: Map<string, LanguageGraphFactory<any>> = new Map();
	private readonly repeatingFactory: RepeatingFactory;

	public readonly tokenizer: Tokenizer;
	public readonly tokenComparer: TokenComparer;

	public constructor(
		tokenizer: Tokenizer,
		tokenComparer: TokenComparer,
		repeatingFactory: RepeatingFactory
	) {
		this.tokenizer = tokenizer;
		this.tokenComparer = tokenComparer;
		this.repeatingFactory = repeatingFactory;
	}

	/**
	 * The identifier of the language.
	 */
	public abstract readonly id: string;

	/**
	 * Create a repeating statement for the given graph.
	 *
	 * @param graph
	 */
	public repeating<V>(graph: Graph<V>): GraphBuilder<V[]> {
		return this.repeatingFactory(this, graph);
	}

	/**
	 * Create and return a matcher for the given factory.
	 *
	 * @param factory
	 */
	public graph<V>(factory: LanguageGraphFactory<V>): Graph<V> {
		const result = this.cachedGraphs.get(factory.id);
		if(result) {
			return result;
		}

		const created = factory.create(this);
		this.cachedGraphs.set(factory.id, created);
		this.graphFactories.set(factory.id, factory);
		return created;
	}

	public findGraph<K extends KnownGraphs>(id: K): Graph<KnownGraphsDataTypes[K]> {
		const cached = this.cachedGraphs.get(id);
		if(! cached) {
			throw new Error('Graph with id `' + id + '` not available for language');
		}

		return cached as any;
	}

	public withVocabulary(vocabulary: Vocabulary): Language {
		const derived = new DerivedLanguage(
			this.id,
			createVocabularyTokenizer(this.tokenizer, vocabulary),
			this.tokenComparer,
			this.repeatingFactory
		);

		/*
		 * Graphs read the vocabulary of the language they are created for, so
		 * every graph this language has is created again for the derived one.
		 */
		for(const factory of this.graphFactories.values()) {
			derived.graph(factory);
		}

		return derived;
	}
}

/**
 * Language that shares everything with the language it was derived from
 * except for its tokenizer, which reads an extended vocabulary.
 */
class DerivedLanguage extends AbstractLanguage {
	public readonly id: string;

	public constructor(
		id: string,
		tokenizer: Tokenizer,
		tokenComparer: TokenComparer,
		repeatingFactory: RepeatingFactory
	) {
		super(tokenizer, tokenComparer, repeatingFactory);

		this.id = id;
	}
}
