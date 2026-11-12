import type { Graph, GraphBuilder } from '../graph/index.js';
import type { TokenComparer, Tokenizer } from '../tokenization/index.js';

import type { KnownGraphs, KnownGraphsDataTypes } from './KnownGraphs.js';
import type { Language } from './Language.js';
import type { LanguageGraphFactory } from './LanguageGraphFactory.js';
import type { LanguageOptions } from './LanguageOptions.js';
import type { LocaleOrigins, NormalizedLanguageOptions, ResolvedLanguageSettings } from './LanguageSettings.js';
import {
	hasLocaleSettings,
	normalizeLanguageOptions,
	resolveLanguageLocale,
	resolveLanguageSettings
} from './LanguageSettings.js';
import type { Vocabulary } from './Vocabulary.js';
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
	private cachedGraphs: Map<string, Graph<any>> = new Map();
	private graphFactories: Map<string, LanguageGraphFactory<any>> = new Map();
	private readonly repeatingFactory: RepeatingFactory;

	public readonly tokenizer: Tokenizer;
	public readonly tokenComparer: TokenComparer;
	public readonly locale: string;
	public readonly options: NormalizedLanguageOptions;

	/**
	 * Where the locale and the region of this language come from.
	 */
	private readonly origins: LocaleOrigins;

	private cachedSettings?: ResolvedLanguageSettings;

	public constructor(
		tokenizer: Tokenizer,
		tokenComparer: TokenComparer,
		repeatingFactory: RepeatingFactory,
		locale: string,
		options: LanguageOptions = {},
		origins: LocaleOrigins = { locale: 'default', region: 'locale' }
	) {
		this.tokenizer = tokenizer;
		this.tokenComparer = tokenComparer;
		this.repeatingFactory = repeatingFactory;
		this.locale = locale;
		this.options = normalizeLanguageOptions(options);
		this.origins = origins;
	}

	public get settings(): ResolvedLanguageSettings {
		this.cachedSettings ??= resolveLanguageSettings(this.id, this.locale, this.options, this.origins);
		return this.cachedSettings;
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
			this.locale,
			createVocabularyTokenizer(this.tokenizer, vocabulary),
			this.tokenComparer,
			this.repeatingFactory,
			this.options,
			this.origins
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

	public withLocale(locale: string, options?: LanguageOptions): Language {
		if(locale === this.locale && typeof options === 'undefined') {
			return this;
		}

		return this.derive({ ...options, locale }, options ?? this.options);
	}

	public withSettings(settings: LanguageOptions): Language {
		return this.derive(settings, settings);
	}

	/**
	 * Create a language that shares the graphs of this one, with another
	 * locale and other options.
	 *
	 * @param localeSettings -
	 *   the settings that say which locale to use
	 * @param options -
	 *   the options the new language gives to each match
	 * @returns
	 *   the new language
	 */
	private derive(localeSettings: LanguageOptions, options: LanguageOptions): Language {
		const current = { locale: this.locale, origins: this.origins };
		const resolved = hasLocaleSettings(localeSettings)
			? resolveLanguageLocale(this.id, current, localeSettings)
			: current;

		const derived = new DerivedLanguage(
			this.id,
			resolved.locale,
			this.tokenizer,
			this.tokenComparer,
			this.repeatingFactory,
			options,
			resolved.origins
		);

		/*
		 * The locale is only read when a match is mapped into a value, so the
		 * graphs are the same for every locale and are shared instead of
		 * being created again.
		 */
		derived.cachedGraphs = this.cachedGraphs;
		derived.graphFactories = this.graphFactories;

		return derived;
	}
}

/**
 * Language that shares everything with the language it was derived from
 * except for its tokenizer, which reads an extended vocabulary, its locale
 * and its options.
 */
class DerivedLanguage extends AbstractLanguage {
	public readonly id: string;

	public constructor(
		id: string,
		locale: string,
		tokenizer: Tokenizer,
		tokenComparer: TokenComparer,
		repeatingFactory: RepeatingFactory,
		options: LanguageOptions,
		origins: LocaleOrigins
	) {
		super(tokenizer, tokenComparer, repeatingFactory, locale, options, origins);

		this.id = id;
	}
}
