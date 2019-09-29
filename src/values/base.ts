import { ValueParserNode, ValueParserOptions } from '../resolver/ValueParserNode';
import { ValueNode, ValueNodeOptions } from '../resolver/ValueNode';
import { Language } from '../language/Language';
import { Node } from '../graph/Node';
import { Matcher, EncounterOptions } from '../graph/matching';

/**
 * Object that can be converted into a node within a graph.
 */
export interface NodeConvertable {
	toNode(id: string): Node;
}

/**
 * Function that creates a convertable item for the given language.
 */
export type LanguageSpecificFactory<V> = (language: Language) => ParsingValue<V>;

export type Value = LanguageSpecificValue<any> | NodeConvertable;

export class LanguageSpecificValue<V> {
	private factory: LanguageSpecificFactory<V>;

	constructor(factory: LanguageSpecificFactory<V>) {
		this.factory = factory;
	}

	public create(language: Language): NodeConvertable {
		return this.factory(language);
	}

	/**
	 * Create a matcher function for this value and the specified language.
	 *
	 * @param {Language} language
	 */
	public matcher(language: Language) {
		const value = this.factory(language);

		return function(text: string, options?: EncounterOptions) {
			return value.matcher.match(text, options);
		};
	}
}

export class ParsingValue<V> {
	public matcher: Matcher<V>;
	private options: ValueParserOptions;

	constructor(parser: Matcher<V>, options?: ValueParserOptions) {
		this.matcher = parser;
		this.options = options || {};
	}

	public toNode(id: string) {
		return new ValueParserNode(id, this.matcher, this.options);
	}
}

export class ValueMatcher<V> {
	private options: ValueNodeOptions<V>;

	constructor(options: ValueNodeOptions<V>) {
		this.options = options;
	}

	public toNode(id: string) {
		return new ValueNode(id, this.options);
	}
}
