import { ValueParserNode, ValueParserOptions } from '../resolver/value-parser';
import { ValueNode, ValueNodeOptions } from '../resolver/value';
import { Language } from '../language/language';
import { Node } from '../graph/node';
import { Matcher } from '../graph/matching';

/**
 * Object that can be converted into a node within a graph.
 */
export interface NodeConvertable {
	toNode(id: string): Node;
}

/**
 * Function that creates a convertable item for the given language.
 */
export type LanguageSpecificFactory = (language: Language) => NodeConvertable;

export class LanguageSpecificValue {
	private factory: LanguageSpecificFactory;

	constructor(factory: LanguageSpecificFactory) {
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
		/*
		const parser = this.factory(language).parser;

		return function(text, options) {
			if(typeof text !== 'string') return Promise.resolve(null);

			return parser.match(text, options);
		};
		*/
	}
}

export class ParsingValue {
	private parser: Matcher<any>;
	private options: ValueParserOptions;

	constructor(parser: Matcher<any>, options?: ValueParserOptions) {
		this.parser = parser;
		this.options = options || {};
	}

	public toNode(id: string) {
		return new ValueParserNode(id, this.parser, this.options);
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
