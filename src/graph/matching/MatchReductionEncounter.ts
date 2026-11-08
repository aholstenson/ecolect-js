import type { Encounter } from './Encounter.js';
import type { MatchSet } from './MatchSet.js';

/**
 * Encounter used to reduce matches
 */
export interface MatchReductionEncounter<RawData> {
	/**
	 * The current encounter.
	 */
	encounter: Encounter;

	/**
	 * Results that are matching.
	 */
	results: MatchSet<RawData>;
}
