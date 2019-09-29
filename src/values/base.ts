import { ValueParserNode, ValueParserOptions } from '../resolver/ValueParserNode';
import { ValueNode, ValueNodeOptions } from '../resolver/ValueNode';
import { Language } from '../language/Language';
import { Node } from '../graph/Node';
import { Matcher, GraphMatcher, GraphMatcherOptions, Encounter } from '../graph/matching';
import { Graph } from '../graph/Graph';
import { MatchReductionEncounter } from '../graph/matching/MatchReductionEncounter';

/**
 * Object that can be converted into a node within a graph.
 */
export interface NodeConvertable<V> {
	toNode(id: string): Node;
}

/**
 * Function that creates a convertable item for the given language.
 */
export type LanguageSpecificFactory<Mapped, MatcherResult> = (language: Language) => ParsingValue<any, Mapped, MatcherResult>;

export type Value<V> = LanguageSpecificValue<V, any> | NodeConvertable<V>;

export class LanguageSpecificValue<Mapped, MatcherResult> {
	private factory: LanguageSpecificFactory<Mapped, MatcherResult>;

	constructor(factory: LanguageSpecificFactory<Mapped, MatcherResult>) {
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
	public matcher(language: Language): Matcher<MatcherResult> {
		const value = this.factory(language);
		return new GraphMatcher(language, value.graph, {
			reducer: value.options.reducer || (({ encounter, results }: MatchReductionEncounter<any>) => {
				const first = results.first();
				if(first === null || typeof first === 'undefined') {
					return null;
				} else {
					return value.options.mapper(first.data, encounter);
				}
			}) as any
		});
	}
}

export interface ParsingValueOptions<RawData, Mapped, MatcherResult> {
	mapper: (data: RawData, encounter: Encounter) => Mapped;

	reducer?: (encounter: MatchReductionEncounter<RawData>) => MatcherResult;

	partialBlankWhenNoToken?: boolean;
}

export class ParsingValue<RawData, Mapped, MatcherResult=Mapped> {
	public graph: Graph<RawData>;
	public options: ParsingValueOptions<RawData, Mapped, MatcherResult>;

	constructor(graph: Graph<RawData>, options: ParsingValueOptions<RawData, Mapped, MatcherResult>) {
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
