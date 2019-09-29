import { Match } from './Match';
import { DateTimeOptions } from '../../time/DateTimeOptions';
import { Encounter } from './Encounter';

/**
 * Options that can be passed to an Encounter.
 */
export interface EncounterOptions extends DateTimeOptions {
	/**
	 * If partial matching is being performed.
	 */
	partial?: boolean;

	/**
	 * If fuzzy matching is being performed.
	 */
	fuzzy?: boolean;

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
	 * Method used to determine if two matches are equal.
	 */
	matchIsEqual?: (options: EncounterOptions) => (a: any, b: any) => boolean;

	/**
	 * Function called when a match is found.
	 */
	onMatch?: (match: Match<any>) => void;
}
