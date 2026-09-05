import type { ValueRenderer } from '../generation/ValueRenderer.js';
import { Encounter, Graph, GraphMatcher, Node } from '../graph/index.js';
import { Language } from '../language/index.js';
import { localeAwareMatcher, Matcher, MatchOptions } from '../matching/index.js';
import { ValueNode, ValueNodeOptions } from '../resolver/ValueNode.js';
import { ValueParserNode } from '../resolver/ValueParserNode.js';

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

/**
 * Function that creates the renderer of a value for the given language.
 */
export type RendererFactory<Mapped> = (language: Language) => ValueRenderer<Mapped> | null;

export type Value<V> = LanguageSpecificValue<V> | NodeConvertable<V>;

export class LanguageSpecificValue<Mapped> {
	private factory: LanguageSpecificFactory<Mapped>;
	private rendererFactory: RendererFactory<Mapped> | undefined;

	public constructor(factory: LanguageSpecificFactory<Mapped>, rendererFactory?: RendererFactory<Mapped>) {
		this.factory = factory;
		this.rendererFactory = rendererFactory;
	}

	public create(language: Language): NodeConvertable<Mapped> {
		return this.factory(language);
	}

	/**
	 * Create the renderer that writes this value as text for the given
	 * language.
	 *
	 * @param language -
	 *   the language the text is written in
	 * @returns
	 *   the renderer, or `null` if this value can not be written as text
	 */
	public renderer(language: Language): ValueRenderer<Mapped> | null {
		return this.rendererFactory ? this.rendererFactory(language) : null;
	}

	/**
	 * Create a matcher function for this value and the specified language.
	 *
	 * @param language
	 */
	public matcher(language: Language): Matcher<Mapped> {
		const value = this.factory(language);
		return localeAwareMatcher(language, new GraphMatcher(value.graph, {
			mapper: (m, options) => value.options.mapper(m.data, options)
		}));
	}
}

export interface ParsingValueOptions<RawData, Mapped> {
	mapper: (data: RawData, options: MatchOptions) => Mapped;

	partialBlankWhenNoToken?: boolean;
}

export class ParsingValue<RawData, Mapped> {
	public graph: Graph<RawData>;
	public options: ParsingValueOptions<RawData, Mapped>;

	public constructor(graph: Graph<RawData>, options: ParsingValueOptions<RawData, Mapped>) {
		this.graph = graph;

		this.options = options;
	}

	public toNode(id: string) {
		return new ValueParserNode(id, this.graph, this.options);
	}
}

export class ValueMatcher<V> implements NodeConvertable<V> {
	private options: ValueNodeOptions<V>;
	private valueRenderer: ValueRenderer<V> | undefined;

	public constructor(options: ValueNodeOptions<V>, valueRenderer?: ValueRenderer<V>) {
		this.options = options;
		this.valueRenderer = valueRenderer;
	}

	public toNode(id: string) {
		return new ValueNode(id, this.options);
	}

	/**
	 * Get the renderer that writes this value as text.
	 *
	 * @returns
	 *   the renderer, or `null` if this value can not be written as text
	 */
	public renderer(): ValueRenderer<V> | null {
		return this.valueRenderer ?? null;
	}
}

/**
 * Get the renderer that writes the given value as text.
 *
 * @param value -
 *   the type of the value
 * @param language -
 *   the language the text is written in
 * @returns
 *   the renderer, or `null` if the value can not be written as text
 */
export function rendererFor(value: Value<any>, language: Language): ValueRenderer<any> | null {
	if(value instanceof LanguageSpecificValue) {
		return value.renderer(language);
	}

	if(value instanceof ValueMatcher) {
		return value.renderer();
	}

	return null;
}
