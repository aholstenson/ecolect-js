import { Encounter } from './Encounter';
import { Language } from '../../language/Language';
import { Node } from '../Node';

import { MatchingState, emptyState } from './MatchingState';
import { MatchSet } from './MatchSet';
import { MatchOptions } from './MatchOptions';
import { EncounterOptions } from './EncounterOptions';
import { Matcher } from './Matcher';
import { Graph } from '../Graph';
import { MatchReductionEncounter } from './MatchReductionEncounter';

export interface GraphMatcherOptions<RawData, V> extends EncounterOptions {
	reducer: (reduction: MatchReductionEncounter<RawData>) => V;
}

/**
 * Matcher that can match expressions against a graph.
 */
export class GraphMatcher<G, V> implements Matcher<V> {
	public readonly language: Language;
	public readonly graph: Graph<G>;
	public readonly options: GraphMatcherOptions<G, V>;

	/**
	 * Internal state of this matcher that is accessed if it is used as a
	 * sub graph.
	 */
	public matchingState: MatchingState;

	constructor(language: Language, graph: Graph<G>, options: GraphMatcherOptions<G, V>) {
		this.language = language;
		this.graph = graph;

		this.options = Object.assign({}, graph.options, options);
		this.matchingState = emptyState();
	}

	/**
	 * Match against the given expression.
	 *
	 * @param {string} expression
	 * @param {object} options
	 * @return {Promise}
	 */
	public match(expression: string, options: MatchOptions={}): Promise<V> {
		if(typeof expression !== 'string') {
			throw new Error('Can only match against string expressions');
		}

		const resolvedOptions = Object.assign({
			onlyComplete: true
		}, this.options, options);

		const tokens = this.language.tokenize(expression);
		const encounter = new Encounter(tokens, resolvedOptions);
		encounter.outgoing = this.graph.nodes;

		const promise = encounter.next(0, 0)
			.then(() => {
				return encounter.matches;
			});

		const reducer = this.options.reducer;
		return promise.then((results: MatchSet<any>) => reducer({
			results,
			encounter
		}));
	}
}
