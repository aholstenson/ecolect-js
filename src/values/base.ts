import { Language } from '../language/Language';

import { Graph } from '../graph/Graph';
import { Node } from '../graph/Node';
import { GraphMatcher, Encounter } from '../graph/matching';

import { ValueParserNode } from '../resolver/ValueParserNode';
import { ValueNode, ValueNodeOptions } from '../resolver/ValueNode';
import { Matcher } from '../matching';

/**
 * Object that can be converted into a node within a graph.
 */
export interface NodeConvertable<V> {
	toNode(id: string): Node;
}

/**
 * Function that creates a convertable item for the given language.
 */
export type LanguageSpecificFactory<Mapped> = (language: Language) => ParsingValue<any, Mapped>;

export type Value<V> = LanguageSpecificValue<V> | NodeConvertable<V>;

export class LanguageSpecificValue<Mapped> {
	private factory: LanguageSpecificFactory<Mapped>;

	constructor(factory: LanguageSpecificFactory<Mapped>) {
		this.factory = factory;
	}

	public create(language: Language): NodeConvertable<Mapped> {
		return this.factory(language);
	}

	/**
	 * Create a matcher function for this value and the specified language.
	 *
	 * @param language
	 */
	public matcher(language: Language): Matcher<Mapped> {
		const value = this.factory(language);
		return new GraphMatcher(language, value.graph, {
			mapper: (m, encounter) => value.options.mapper(m.data, encounter)
		});
	}
}

export interface ParsingValueOptions<RawData, Mapped> {
	mapper: (data: RawData, encounter: Encounter) => Mapped;

	partialBlankWhenNoToken?: boolean;
}

export class ParsingValue<RawData, Mapped> {
	public graph: Graph<RawData>;
	public options: ParsingValueOptions<RawData, Mapped>;

	constructor(graph: Graph<RawData>, options: ParsingValueOptions<RawData, Mapped>) {
		this.graph = graph;

		this.options = options;
	}

	public toNode(id: string) {
		return new ValueParserNode(id, this.graph, this.options);
	}
}

export class ValueMatcher<V> implements NodeConvertable<V> {
	private options: ValueNodeOptions<V>;

	constructor(options: ValueNodeOptions<V>) {
		this.options = options;
	}

	public toNode(id: string) {
		return new ValueNode(id, this.options);
	}
}
