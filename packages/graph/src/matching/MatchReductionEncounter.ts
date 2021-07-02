import { Encounter } from './Encounter';
import { MatchSet } from './MatchSet';

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
