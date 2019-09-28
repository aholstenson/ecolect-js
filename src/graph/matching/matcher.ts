import { Encounter, EncounterOptions } from './encounter';
import { Language } from '../../language/language';
import { Node } from '../node';

import { MatchingState, emptyState } from './matching-state';
import { MatchSet } from './match-set';

export interface MatchReductionEncounter<RawData, MappedData> {
	encounter: Encounter;

	results: MatchSet<RawData>;

	map: (object: RawData) => MappedData;
}

export interface MatcherOptions<V> extends EncounterOptions {
	name?: string;

	reducer?: (reduction: MatchReductionEncounter<any, any>) => V;

	mapper?: (result: any, encounter: Encounter) => any;
}

/**
 * Matcher that can match expressions against a graph.
 */
export class Matcher<V> {
	public readonly language: Language;
	public readonly nodes: Node[];
	public readonly options: MatcherOptions<V>;

	/**
	 * Internal state of this matcher that is accessed if it is used as a
	 * sub graph.
	 */
	public matchingState: MatchingState;

	constructor(language: Language, nodes: Node[], options: MatcherOptions<V>) {
		this.language = language;
		this.nodes = nodes;

		this.options = options;
		this.matchingState = emptyState();
	}

	/**
	 * Match against the given expression.
	 *
	 * @param {string} expression
	 * @param {object} options
	 * @return {Promise}
	 */
	public match(expression: string, options: EncounterOptions={}): Promise<V> {
		if(typeof expression !== 'string') {
			throw new Error('Can only match against string expressions');
		}

		const resolvedOptions = Object.assign({
			onlyComplete: true
		}, this.options, options);

		const tokens = this.language.tokenize(expression);
		const encounter = new Encounter(tokens, resolvedOptions);
		encounter.outgoing = this.nodes;

		const promise = encounter.next(0, 0)
			.then(() => {
				return encounter.matches;
			});

		if(this.options.reducer) {
			const reducer = this.options.reducer;
			return promise.then((results: MatchSet<any>) => reducer({
				results,
				encounter,
				map: (object: any) => this.options.mapper
					? this.options.mapper(object, encounter)
					: object
				}
			));
		} else {
			return promise.then((results: MatchSet<any>) => {
				const asArray = results.toArray();
				let mapped;
				if(this.options.mapper) {
					const mapper = this.options.mapper;
					mapped = asArray.map(match => mapper(match.data, encounter));
				} else {
					mapped = asArray.map(match => match.data);
				}

				// Forcefully convert into V type
				return mapped as unknown as V;
			});
		}
	}
}
