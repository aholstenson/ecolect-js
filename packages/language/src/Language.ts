import { Graph, GraphBuilder } from '@ecolect/graph';
import { TokenComparer, Tokenizer } from '@ecolect/tokenization';

import { KnownGraphs, KnownGraphsDataTypes } from './KnownGraphs.js';
import { LanguageGraphFactory } from './LanguageGraphFactory.js';
import { Vocabulary } from './Vocabulary.js';

/**
 * Language usable with Ecolect.
 */
export interface Language {
	/**
	 * The identifier of the language.
	 */
	readonly id: string;

	/**
	 * The locale this language reads expressions as, such as `en-GB`. The
	 * locale decides the conventions used when nothing is set in the options
	 * of a match, such as the order of the fields in a numeric date.
	 */
	readonly locale: string;

	readonly tokenizer: Tokenizer;

	readonly tokenComparer: TokenComparer;

	/**
	 * Get or create a graph.
	 *
	 * @param factory
	 */
	graph<D>(factory: LanguageGraphFactory<D>): Graph<D>;

	/**
	 * Create a repeating statement for the given graph.
	 *
	 * @param matcher
	 */
	repeating<V>(graph: Graph<V>): GraphBuilder<V[]>;

	/**
	 * Get a known graph from the language.
	 *
	 * @param id
	 */
	findGraph<K extends KnownGraphs>(id: K): Graph<KnownGraphsDataTypes[K]>;

	/**
	 * Get a language that understands the given vocabulary in addition to
	 * everything this language understands. This language is left unchanged.
	 *
	 * @param vocabulary -
	 *   the extra words to understand
	 */
	withVocabulary(vocabulary: Vocabulary): Language;

	/**
	 * Get a language that reads expressions as the given locale. The words
	 * understood do not change, only the conventions, so the new language
	 * shares the graphs of this one. This language is left unchanged.
	 *
	 * @param locale -
	 *   the locale to read expressions as, as a BCP 47 language tag
	 */
	withLocale(locale: string): Language;
}
