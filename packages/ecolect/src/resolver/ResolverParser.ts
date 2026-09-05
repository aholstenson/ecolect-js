import { deepEqual } from 'fast-equals';

import {
	Collectable,
	GraphBuildable,
	GraphBuildableArray,
	GraphBuilder,
	Node,
	TokenNode
} from '@ecolect/graph';
import { Language } from '@ecolect/language';

import { LanguageSpecificValue, NodeConvertable, Value } from '../values/base.js';

import { expandPhrase } from './expandPhrase.js';
import { ValueNode } from './ValueNode.js';

const VALUE = /{([a-zA-Z0-9]+)}/g;

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
	 * @param nodes -
	 *   the phrase, as a single item or an array of items
	 * @param value -
	 *   the value to record when the phrase matches
	 * @returns
	 *   self
	 */
	public add(nodes: GraphBuildableArray<V>, value: Collectable<V>): this {
		const items = Array.isArray(nodes) ? nodes : [ nodes ];

		/*
		 * Every item may be written in several ways, so the phrases added are
		 * the combinations of the ways their items can be written.
		 */
		let variants: GraphBuildable<V>[][] = [ [] ];
		for(const item of items) {
			const expanded = typeof item === 'string'
				? expandPhrase(item)
				: [ item ];

			const next: GraphBuildable<V>[][] = [];
			for(const variant of variants) {
				for(const alternative of expanded) {
					next.push([ ...variant, alternative ]);
				}
			}

			variants = next;
		}

		for(const variant of variants) {
			super.add(variant, value);
		}

		return this;
	}

	protected parse(text: string): Node {
		let firstNode;
		let node: Node | undefined;
		const parse = (from: number, to: number) => {
			const sub = text.substring(from, to);
			for(const token of this.tokenizer(sub)) {
				const nextNode = new TokenNode(this.tokenComparer, token);

				if(node) {
					node.outgoing.push(nextNode);
				} else {
					firstNode = nextNode;
				}
				node = nextNode;
			}
		};

		let previousIndex = 0;
		VALUE.lastIndex = 0;
		let match;
		while((match = VALUE.exec(text))) {
			if(match.index !== 0) {
				parse(previousIndex, match.index);
			}
			previousIndex = VALUE.lastIndex;

			const id = match[1];
			const value = this.values.get(id);
			if(! value) {
				throw new Error('No type registered for ' + id);
			}

			const nextNode = value.toNode(id);

			if(node) {
				node.outgoing.push(nextNode);
			} else {
				firstNode = nextNode;
			}
			node = nextNode;
		}

		// Parse the remaining text
		parse(previousIndex, text.length);

		if(! firstNode) {
			throw new Error('Could not parse data into nodes');
		}

		return firstNode;
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
