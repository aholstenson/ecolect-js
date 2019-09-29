import { Node } from '../graph/Node';
import { Encounter, Match } from '../graph/matching';
import { isDeepEqual } from '../utils/equality';
import { Tokens } from '../language/tokens';
import { ValueEncounter } from './ValueEncounter';

/**
 * Options for a ValueNode.
 */
export interface ValueNodeOptions<V> {
	/**
	 * Make the node try to match as much as possible and then work
	 * backward until it finds the smallest possible match.
	 */
	greedy?: boolean;

	/**
	 * Make the value short circuit after it has first found a value. Useful
	 * when remotely validating values and using them in conjunction with
	 * repeating things such as option values.
	 */
	onlySingle?: boolean;

	/**
	 * The maximum number of hits to match, defaults to 10. If a value
	 * generates more matches during a partial match the top scoring matches
	 * will be returned.
	 */
	max?: number;

	/**
	 * Function used to match the textual value. May be called many times
	 * during matching so it is recommended to use caching to reduce network
	 * traffic and latency for the user.
	 */
	match: (encounter: ValueEncounter<V>) => Promise<void>;
}

/**
 * Custom node used by resolvers to match free-text expressions. This node
 * is greedy and matches as much as it can. This is done by checking if the
 * rest of the expression can match and then after that asking the value if
 * it matches.
 *
 * This type of node supports a few options:
 *
 * *
 * 	`greedy` - make the node try to match as much as possible and then work
 *   backward until it finds the smallest possible match.
 * *
 * 	`onlySingle` - make the value short circuit after it has first found a
 *   value. Useful when remotely validating values and using them in
 *   conjunction with repeating things such as options.
 *
 * *
 *  `max` - the maximum number of hits to match, defaults to 10. If a value
 *   generates more matches during a partial match the top scoring matches
 *   will be returned.
 */
export class ValueNode<V> extends Node {
	public readonly id: string;
	private options: ValueNodeOptions<V>;

	constructor(id: string, options: ValueNodeOptions<V>) {
		super();

		this.id = id;
		this.options = options;
	}

	public match(encounter: Encounter) {
		const tokens = encounter.tokens;
		const currentIndex = encounter.currentIndex;
		const stop = tokens.length;

		/**
		 * Values always try to match as much as they can so we loop backwards
		 * from the largest amount of tokens we could consume to only 1.
		 */
		const valueEncounter = new ValueEncounterImpl<V>(encounter);
		const results: Match<any>[] = [];

		if(currentIndex >= stop) {
			/*
			 * If the current index has passed the end of the tokens either
			 * assume this will match in the future if this is partial or
			 * short circuit without looking ahead in the graph.
			 */
			return encounter.isPartial ? encounter.next(0.0, 0) : Promise.resolve();
		}

		const onMatch = (m: Match<any>) => {
			valueEncounter.matches.length = 0;
			return Promise.resolve(this.options.match(valueEncounter))
				.then(() => {
					if(valueEncounter.matches.length === 0) return;

					for(const v of valueEncounter.matches) {
						const matchCopy = m.copy();
						matchCopy.data.values.set(this.id, v.value);
						matchCopy.scoreData.score += 0.9 * v.score;
						results.push(matchCopy);
					}
				});
		};

		const match = (idx: number): Promise<void> => {
			const len = idx - currentIndex;

			if((this.options.greedy && len === 0)
				|| (! this.options.greedy && idx > tokens.length)
			) return Promise.resolve();

			valueEncounter._adjust(currentIndex, idx);
			return encounter.branchWithOnMatch(onMatch, () => encounter.next(0, len))
				.then(() => {
					// Attempting to match only a single match and already found it
					if(this.options.onlySingle && results.length > 0) return;

					if(this.options.greedy) {
						if(len > 1) {
							return match(idx - 1);
						}
					} else {
						if(idx < tokens.length) {
							return match(idx + 1);
						}
					}
				});
		};

		return match(this.options.greedy ? stop : currentIndex + 1)
			.then(() => {
				// Sort and limit the matches
				const sorted = results.sort((a, b) => b.score - a.score);
				const limited = sorted.slice(0, Math.min(sorted.length, this.options.max || 10));

				// Match all of the top matches
				for(const result of limited) {
					encounter.match(result);
				}
			});
	}

	public equals(obj: Node): boolean {
		return obj instanceof ValueNode
			&& isDeepEqual(this.options, obj.options);
	}

	public toString() {
		return 'ValueNode[' + this.id + ']';
	}
}


class ValueEncounterImpl<V> implements ValueEncounter<V> {
	public matches: ValueMatch<V>[];
	private encounter: Encounter;
	public partial: boolean;
	public tokens: Tokens;

	constructor(encounter: Encounter) {
		this.encounter = encounter;
		this.partial = encounter.options.partial || false;
		this.matches = [];
		this.tokens = Tokens.empty();
	}

	public _adjust(from: number, end: number) {
		this.tokens = this.encounter.tokens.slice(from, end);
		this.matches.length = 0;
	}

	/**
	 * Get the text of the value.
	 */
	get text() {
		return this.tokens.raw();
	}

	/**
	 * Add a new value that has matched.
	 *
	 * @param value
	 * @param score
	 */
	public match(value: V, score=1) {
		if(! this.partial && this.matches.length >= 1) {
			throw new Error('Multiple matches are only supported when in partial mode');
		}

		this.matches.push({ value, score });
	}
}

/**
 * Match as found during encounter with value.
 */
interface ValueMatch<V> {
	/**
	 * The value matched.
	 */
	value: V;

	/**
	 * Local score of the value.
	 */
	score: number;
}
