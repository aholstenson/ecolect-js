import { deepEqual } from 'fast-equals';

import type {
	Collectable,
	GraphBuildable,
	GraphBuildableArray } from '../graph/index.js';
import { GraphBuilder } from '../graph/index.js';
import type { Language } from '../language/index.js';
import type { NodeConvertable, Value } from '../values/base.js';
import { LanguageSpecificValue } from '../values/base.js';

import type { CompileContext } from './compilePhrase.js';
import { compilePhrase } from './compilePhrase.js';
import { ValueNode } from './ValueNode.js';

/**
 * Extension to the normal parser that handles referring to values by
 * name in the text, and text that describes several phrases via groups of
 * alternatives such as `[Show|List] orders`.
 */
export class ResolverParser<V> extends GraphBuilder<V> {
	private readonly language: Language;
	private readonly values: Map<string, NodeConvertable<any>>;

	public constructor(language: Language) {
		super(language);

		this.language = language;

		this.values = new Map();

		this.supportsFuzzy();
		this.allowPartial();

		/*
		 * People end chat and voice input with `.`, `?` or `!`, and put commas
		 * between words. A phrase matches when the expression has punctuation
		 * that the phrase does not have.
		 */
		this.skipPunctuation();
	}

	public value(id: string, type: Value<any>): this {
		let factory = type;
		if(factory instanceof LanguageSpecificValue) {
			factory = factory.create(this.language);
		}

		if(typeof factory === 'function') {
			const matcher = factory;
			factory = {
				toNode(valueId: string) {
					return new ValueNode(valueId, {
						match: matcher
					});
				}
			};
		}

		this.values.set(id, factory);
		return this;
	}

	/**
	 * Add a phrase and the value to record when it matches. Text within the
	 * phrase may describe several ways to say the same thing, in which case
	 * every way is added.
	 *
	 * The phrase is compiled into nodes that share the words around each
	 * group, see `compilePhrase`.
	 *
	 * @param nodes -
	 *   the phrase, as a single item or an array of items
	 * @param value -
	 *   the value to record when the phrase matches
	 * @returns
	 *   self
	 */
	public add(nodes: GraphBuildableArray<V>, value: Collectable<V>): this {
		const items: GraphBuildable<V>[] = Array.isArray(nodes) ? nodes : [ nodes ];

		compilePhrase(this.compileContext(), items, value);

		return this;
	}

	/**
	 * Give the phrase compiler access to this parser.
	 *
	 * @returns
	 *   the context for the compiler
	 */
	private compileContext(): CompileContext {
		return {
			builder: this,
			tokenize: text => this.tokenizer(text),
			createTokenNode: token => this.createTokenNode(token),
			value: id => this.values.get(id),
			addRoots: nodes => this.addRoots(nodes)
		};
	}

	public build() {
		/*
		 * A match that only exposes the highest scoring result counts every
		 * match as a duplicate, so that the set keeps the best one.
		 *
		 * Partial matches and matches that return everything are all handed
		 * back to the caller, so they are only duplicates when they resolved
		 * the same values. Without this two phrases that resolve to the same
		 * thing would both be suggested.
		 */
		this.options.matchIsEqual = e => e.partial || e.all
			? (a, b) => deepEqual(a.values, b.values)
			: () => true;

		return super.build();
	}
}
