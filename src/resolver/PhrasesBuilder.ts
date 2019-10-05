import { Matcher } from '../matching/Matcher';
import { ResolverParser }  from './ResolverParser';
import { Language } from '../language/Language';
import { Value } from '../values/base';
import { Match as GraphMatch, GraphMatcher, Encounter } from '../graph/matching';
import { GraphBuildable } from '../graph/GraphBuilder';
import { Phrase } from './Phrase';
import { Phrases } from './Phrases';

/**
 * This is a basic naive builder for instances of Resolver on top of the
 * parser.
 */
export class PhrasesBuilder<Values extends object = {}> {
	private values: Map<string, Value<any>>;
	private phrases: GraphBuildable<any>[][];

	constructor() {
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
