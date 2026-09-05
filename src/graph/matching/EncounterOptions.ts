import { MatchHandler } from './MatchHandler.js';

/**
 * Function that creates the equality check used to find duplicate matches.
 * The check is created for every encounter, so it can be adapted to the
 * options the expression is matched with.
 */
export type MatchIsEqual = (options: EncounterOptions) => (a: any, b: any) => boolean;

/**
 * Options that can be passed to an Encounter.
 */
export interface EncounterOptions {
	/**
	 * If partial matching is being performed.
	 */
	partial?: boolean;

	/**
	 * If fuzzy matching is being performed.
	 */
	fuzzy?: boolean;

	/**
	 * If every match should be kept instead of only the best one.
	 */
	all?: boolean;

	/**
	 * Only match if all tokens have been consumed.
	 */
	onlyComplete?: boolean;

	/**
	 * If punctuation should be skipped.
	 */
	skipPunctuation?: boolean;

	/**
	 * If partial matching is supported.
	 */
	supportsPartial?: boolean;

	/**
	 * If fuzzy matching is supported.
	 */
	supportsFuzzy?: boolean;

	/**
	 * Normalized tokens that may be left out, in addition to the ones the
	 * tokenizer has marked as skippable.
	 */
	skippableTokens?: ReadonlySet<string>;

	/**
	 * Method used to determine if two matches are equal.
	 */
	matchIsEqual?: MatchIsEqual;

	/**
	 * Function called when a match is found.
	 */
	onMatch?: MatchHandler;
}
