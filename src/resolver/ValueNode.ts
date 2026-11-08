import { deepEqual } from 'fast-equals';

import type { Encounter, Match, MaybePromise } from '../graph/index.js';
import { Node, after, sequence } from '../graph/index.js';
import { Tokens } from '../tokenization/index.js';

import type { ValueEncounter } from './ValueEncounter.js';

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
	 * If the value matches any text. Words that may be left out, such as
	 * `the`, are then read as part of the value and not skipped around it.
	 */
	anyText?: boolean;

	/**
	 * The maximum number of hits to match, defaults to 10. If a value
	 * generates more matches during a partial match the top scoring matches
	 * will be returned.
	 */
	max?: number;

	/**
	 * Function used to match the textual value. May be called many times
	 * during matching so it is recommended to use caching to reduce network
	 * traffic and latency for the user. The function may return a promise
	 * if it needs to wait for something, such as a remote lookup.
	 *
	 * If the function throws or its promise rejects, the value does not
	 * match, and other phrases can still match. If nothing matches, the
	 * match rejects with an error that names the value and has the original
	 * error as its `cause`.
	 */
	match: (encounter: ValueEncounter<V>) => Promise<void> | void;
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

	public constructor(id: string, options: ValueNodeOptions<V>) {
		super();

		this.id = id;
		this.options = options;
		this.readsAnyText = options.anyText ?? false;
	}

	public match(encounter: Encounter): MaybePromise<unknown> {
		const tokens = encounter.tokens;
		const currentIndex = encounter.currentIndex;
		const stop = tokens.length;

		if(currentIndex >= stop) {
			/*
			 * If the current index has passed the end of the tokens either
			 * assume this will match in the future if this is partial or
			 * short circuit without looking ahead in the graph.
			 */
			return encounter.isPartial ? encounter.advance(0.0, 0) : undefined;
		}

		/**
		 * Values always try to match as much as they can so we loop backwards
		 * from the largest amount of tokens we could consume to only 1.
		 */
		const valueEncounter = new ValueEncounterImpl<V>(encounter);
		const results: Match<any>[] = [];

		const onMatch = (m: Match<any>) => {
			valueEncounter.matches.length = 0;
			return after(this.matchValue(encounter, valueEncounter), matched => {
				if(! matched || valueEncounter.matches.length === 0) return;

				for(const v of valueEncounter.matches) {
					const matchCopy = m.copy();
					matchCopy.data.values[this.id] = v.value;
					matchCopy.scoreData.score += 0.9 * v.score;
					results.push(matchCopy);
				}
			});
		};

		/*
		 * The indexes to try, in order. Greedy values start with everything
		 * and shrink, other values start with a single token and grow.
		 */
		const greedy = this.options.greedy || false;
		const steps = stop - currentIndex;
		const indexAt = (step: number) => greedy ? stop - step : currentIndex + 1 + step;

		const attempt = (step: number): MaybePromise<unknown> => {
			// Attempting to match only a single match and already found it
			if(this.options.onlySingle && results.length > 0) return;

			const idx = indexAt(step);
			const len = idx - currentIndex;

			valueEncounter._adjust(currentIndex, idx);

			/*
			 * The rest of the phrase is in the same graph, so its collector
			 * must also see the values matched before this value.
			 */
			/*
			 * A value that reads any text also tries the longer text, so
			 * skipping a skippable word right after the value would give the
			 * same match again with less text.
			 */
			return encounter.branchWithOnMatch(onMatch, () => encounter.advance(0, len, undefined, ! this.readsAnyText), false);
		};

		return after(sequence(steps, attempt), () => {
			/*
			 * Sort and limit the matches. Matches with the same score are
			 * sorted so that the one that reads the most input comes first.
			 * Without this the limit keeps the shortest values and can drop
			 * the only match that reads all of the input.
			 */
			const sorted = results.sort((a, b) => (b.score - a.score) || (b.index - a.index));

			/*
			 * The phrase can continue after the value in several ways that
			 * give the same match, for example when a partial expression ends
			 * before a group that may be left out. Only the first of matches
			 * that end at the same index with the same values counts toward
			 * the limit, so that copies do not push out other values.
			 */
			const max = this.options.max || 10;
			const limited: Match<any>[] = [];
			for(const match of sorted) {
				if(limited.length >= max) break;

				const isCopy = limited.some(other => other.index === match.index
					&& deepEqual(other.data.values, match.data.values));
				if(! isCopy) {
					limited.push(match);
				}
			}

			// Match all of the top matches
			return sequence(limited.length, i => encounter.match(limited[i]));
		});
	}

	/**
	 * Ask the value if it matches the current text. An error from the value
	 * is recorded on the encounter, and the value does not match.
	 *
	 * @param encounter -
	 *   the encounter the value is matched in
	 * @param valueEncounter -
	 *   the encounter given to the value
	 * @returns
	 *   `true` if the value did not fail, via a promise if the value returned
	 *   a promise
	 */
	private matchValue(encounter: Encounter, valueEncounter: ValueEncounterImpl<V>): MaybePromise<boolean> {
		const fail = (err: unknown) => {
			encounter.reportError(new Error(
				'Value `' + this.id + '` could not be matched: '
					+ (err instanceof Error ? err.message : String(err)),
				{ cause: err }
			));
			return false;
		};

		let result;
		try {
			result = this.options.match(valueEncounter);
		} catch(err) {
			return fail(err);
		}

		if(result && typeof result.then === 'function') {
			return result.then(() => true, fail);
		}

		return true;
	}

	public equals(obj: Node): boolean {
		// Nodes for different names are never merged, as the name is part of the result
		return obj instanceof ValueNode
			&& this.id === obj.id
			&& deepEqual(this.options, obj.options);
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

	public constructor(encounter: Encounter) {
		this.encounter = encounter;
		this.partial = encounter.isPartialInput;
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
	public get text() {
		return this.tokens.raw();
	}

	/**
	 * Add a new value that has matched.
	 *
	 * @param value
	 * @param score
	 */
	public match(value: V, score=1) {
		/*
		 * The score is added to the score of the phrase, so a score outside
		 * of 0 to 1, or one that is not a number, would break the order of
		 * the matches.
		 */
		score = Number.isFinite(score) ? Math.min(1, Math.max(0, score)) : 0;

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
