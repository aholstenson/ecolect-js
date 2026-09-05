import { GraphBuildable } from '@ecolect/graph';
import { Language } from '@ecolect/language';

import { Value } from '../values/base.js';

import { Phrases } from './Phrases.js';

/**
 * This is a basic naive builder for instances of Resolver on top of the
 * parser.
 */
export class PhrasesBuilder<Values extends object = object> {
	private values: Map<string, Value<any>>;
	private phrases: GraphBuildable<any>[][];
	private skippableWords: string[];

	public constructor() {
		this.values = new Map();
		this.phrases = [];
		this.skippableWords = [];
	}

	public value<I extends string, V>(id: I, type: Value<V>): PhrasesBuilder<Values & { [K in I]: V | undefined }> {
		this.values.set(id, type);
		return this as any;
	}

	/**
	 * Add a phrase that may be matched. Values are referred to by name, as in
	 * `Orders for {customer}`.
	 *
	 * A phrase can describe several ways to say the same thing via groups of
	 * alternatives. Alternatives within `(` and `)` must match, alternatives
	 * within `[` and `]` may also be left out, and `|` separates them, so
	 * `[Show|List] orders (from|in) {when}` matches `show orders from today`,
	 * `list orders in January` and `orders from today`. Groups can not contain
	 * other groups.
	 *
	 * @param args -
	 *   the phrase, as text or as nodes to match
	 * @returns
	 *   self
	 */
	public phrase(...args: GraphBuildable<any>[]): this {
		this.phrases.push(args);
		return this;
	}

	/**
	 * Allow the given words to be left out of the input when these phrases are
	 * matched. Use this for filler words, such as `please`, that only make
	 * sense for these phrases and should not be skippable everywhere.
	 *
	 * @param words -
	 *   the words that may be left out
	 * @returns
	 *   self
	 */
	public skippable(...words: string[]): this {
		this.skippableWords.push(...words);
		return this;
	}

	public build() {
		return new Phrases<Values>(this.values, this.phrases, this.skippableWords);
	}

	public toMatcher(language: Language) {
		return this.build().toMatcher(language);
	}
}
