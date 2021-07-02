import { Graph } from './Graph';
import { Encounter } from './matching/Encounter';
import { Match } from './matching/Match';
import { MatchingState, emptyState } from './matching/MatchingState';
import { MatchSet } from './matching/MatchSet';

export interface GraphMatcherOptions<RawData, V> {
	/**
	 * If fuzzy matching is being performed.
	 */
	fuzzy?: boolean;

	mapper: (data: Match<RawData>, options: any, encounter: Encounter) => V;
}

export interface GraphMatchOptions {
	fuzzy?: boolean;
}

/**
 * Matcher that can match expressions against a graph.
 */
export class GraphMatcher<G, V> {
	public readonly graph: Graph<G>;
	public readonly options: GraphMatcherOptions<G, V>;

	/**
	 * Internal state of this matcher that is accessed if it is used as a
	 * sub graph.
	 */
	public matchingState: MatchingState;

	public constructor(graph: Graph<G>, options: GraphMatcherOptions<G, V>) {
		this.graph = graph;

		this.options = Object.assign({}, graph.options, options);
		this.matchingState = emptyState();
	}

	/**
	 * Match against the given expression.
	 *
	 * @param expression
	 * @param options
	 * @returns
	 */
	public match(expression: string, options: GraphMatchOptions={}): Promise<V | null> {
		if(typeof expression !== 'string') {
			throw new Error('Can only match against string expressions');
		}

		const resolvedOptions = Object.assign({
			onlyComplete: true
		}, this.options, options);

		const tokens = this.graph.tokenizer(expression);
		const encounter = new Encounter(tokens, resolvedOptions);
		encounter.outgoing = this.graph.nodes;

		const promise = encounter.next(0, 0)
			.then(() => {
				return encounter.matches;
			});

		const mapper = this.options.mapper;
		return promise.then((results: MatchSet<any>) => {
			const first = results.first();
			if(! first) return null;

			return mapper(first, encounter.options, encounter);
		});
	}

	/**
	 * Perform a partial match against the given expression.
	 *
	 * @param expression
	 * @param options
	 */
	public matchPartial(expression: string, options: GraphMatchOptions={}): Promise<V[]> {
		if(typeof expression !== 'string') {
			throw new Error('Can only match against string expressions');
		}

		const resolvedOptions = Object.assign({
			onlyComplete: true,
			partial: true,
		}, this.options, options);

		const tokens = this.graph.tokenizer(expression);
		const encounter = new Encounter(tokens, resolvedOptions);
		encounter.outgoing = this.graph.nodes;

		const promise = encounter.next(0, 0)
			.then(() => {
				return encounter.matches;
			});

		const mapper = this.options.mapper;
		return promise.then((results: MatchSet<any>) => results.toArray()
			.map(value => mapper(value, encounter.options, encounter))
		);
	}
}
