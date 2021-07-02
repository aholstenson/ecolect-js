import { Tokens } from '@ecolect/tokenization';

/**
 * Encounter used matching a custom value.
 */
export interface ValueEncounter<V> {
	/**
	 * If this is a partial search. Partial searches may add several matches,
	 * while non-partial matches will error if several matches are added.
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
	 * Add a match for this value.
	 *
	 * @param value
	 *   value matched
	 * @param score
	 *   optional score of the match, should be in the range 0..1
	 */
	match(value: V, score?: number): void;
}
