import { deepEqual } from 'fast-equals';

import { GraphBuilder, Node, TokenNode } from '@ecolect/graph';
import { Language } from '@ecolect/language';

import { LanguageSpecificValue, NodeConvertable, Value } from '../values/base';

import { ValueNode } from './ValueNode';

const VALUE = /{([a-zA-Z0-9]+)}/g;

/**
 * Extension to the normal parser that handles referring to values by
 * name in the text.
 *
 * TODO: Extended grammar for optional tokens and OR between tokens?
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
		this.options.matchIsEqual = (e) => e.partial
			? (a, b) => a.intent === b.intent && deepEqual(a.values, b.values)
			: (a, b) => a.intent === b.intent;

		return super.build();
	}
}
