import type { Tokens } from '../tokenization/index.js';

/**
 * Encounter used matching a custom value.
 */
export interface ValueEncounter<V> {
	/**
	 * If this is a partial search. A partial search can stop in the middle of
	 * the value, so the text can be the start of a longer value.
	 */
	readonly partial: boolean;

	/**
	 * The current tokens being matched.
	 */
	readonly tokens: Tokens;

	/**
	 * The raw text of the tokens.
	 */
	readonly text: string;

	/**
	 * Add a match for this value. A value can add several matches for the
	 * same text, such as two contacts with the same name. A single match then
	 * uses the one with the highest score, and a match of everything returns
	 * all of them.
	 *
	 * @param value
	 *   value matched
	 * @param score
	 *   optional score of the match, should be in the range 0..1
	 */
	match(value: V, score?: number): void;
}
