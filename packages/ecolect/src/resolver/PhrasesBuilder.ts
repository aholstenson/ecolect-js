import { GraphBuildable } from '@ecolect/graph';
import { Language } from '@ecolect/language';

import { Value } from '../values/base';

import { Phrases } from './Phrases';

/**
 * This is a basic naive builder for instances of Resolver on top of the
 * parser.
 */
export class PhrasesBuilder<Values extends object = object> {
	private values: Map<string, Value<any>>;
	private phrases: GraphBuildable<any>[][];

	public constructor() {
		this.values = new Map();
		this.phrases = [];
	}

	public value<I extends string, V>(id: I, type: Value<V>): PhrasesBuilder<Values & { [K in I]: V | undefined }> {
		this.values.set(id, type);
		return this as any;
	}

	public phrase(...args: GraphBuildable<any>[]): this {
		this.phrases.push(args);
		return this;
	}

	public build() {
		return new Phrases<Values>(this.values, this.phrases);
	}

	public toMatcher(language: Language) {
		return this.build().toMatcher(language);
	}
}
