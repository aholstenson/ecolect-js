import { Graph, GraphBuilder } from '@ecolect/graph';
import { TokenComparer, Tokenizer } from '@ecolect/tokenization';

import { KnownGraphs, KnownGraphsDataTypes } from './KnownGraphs';
import { Language } from './Language';
import { LanguageGraphFactory } from './LanguageGraphFactory';

/**
 * Abstract implementation of Language. This is the root that languages should
 * extend.
 */
export abstract class AbstractLanguage implements Language {
	private readonly cachedGraphs: Map<string, Graph<any>> = new Map();

	public readonly tokenizer: Tokenizer;
	public readonly tokenComparer: TokenComparer;

	public constructor(
		tokenizer: Tokenizer,
		tokenComparer: TokenComparer
	) {
		this.tokenizer = tokenizer;
		this.tokenComparer = tokenComparer;
	}

	/**
	 * The identifier of the language.
	 */
	public abstract readonly id: string;

	/**
	 * Create a repeating statement for the given matcher.
	 *
	 * @param matcher
	 */
	public abstract repeating<V>(graph: Graph<V>): GraphBuilder<V[]>;

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
		return created;
	}

	public findGraph<K extends KnownGraphs>(id: K): Graph<KnownGraphsDataTypes[K]> {
		const cached = this.cachedGraphs.get(id);
		if(! cached) {
			throw new Error('Graph with id `' + id + '` not available for language');
		}

		return cached as any;
	}
}
