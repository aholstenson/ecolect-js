import { Graph } from './Graph.js';
import { Encounter } from './matching/Encounter.js';
import { Match } from './matching/Match.js';

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

export interface GraphMatchAllOptions extends GraphMatchOptions {
	/**
	 * The maximum number of matches to return. All of the matches are returned
	 * if this is not set.
	 */
	limit?: number;
}

/**
 * Matcher that can match expressions against a graph.
 */
export class GraphMatcher<G, V> {
	public readonly graph: Graph<G>;
	public readonly options: GraphMatcherOptions<G, V>;

	public constructor(graph: Graph<G>, options: GraphMatcherOptions<G, V>) {
		this.graph = graph;

		this.options = Object.assign({}, graph.options, options);
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

		const mapper = this.options.mapper;
		return encounter.next(0, 0).then(() => {
			const first = encounter.matches.first();
			if(! first) return null;

			return mapper(first, encounter.options, encounter);
		});
	}

	/**
	 * Match against the given expression, returning every match that consumed
	 * the whole expression. The matches are ordered by score, with the best
	 * match first.
	 *
	 * @param expression -
	 *   the expression to match
	 * @param options -
	 *   options for this match, such as the maximum number of matches to
	 *   return
	 * @returns
	 *   the matches, best one first
	 */
	public matchAll(expression: string, options: GraphMatchAllOptions={}): Promise<V[]> {
		if(typeof expression !== 'string') {
			throw new Error('Can only match against string expressions');
		}

		const { limit, ...matchOptions } = options;

		const resolvedOptions = Object.assign({
			onlyComplete: true,
			all: true
		}, this.options, matchOptions);

		const tokens = this.graph.tokenizer(expression);
		const encounter = new Encounter(tokens, resolvedOptions);
		encounter.outgoing = this.graph.nodes;

		const mapper = this.options.mapper;
		return encounter.next(0, 0).then(() => {
			let matches = encounter.matches.toArray();
			if(typeof limit === 'number') {
				matches = matches.slice(0, Math.max(0, limit));
			}

			return matches.map(value => mapper(value, encounter.options, encounter));
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

		const mapper = this.options.mapper;
		return encounter.next(0, 0).then(() => encounter.matches.toArray()
			.map(value => mapper(value, encounter.options, encounter))
		);
	}
}
