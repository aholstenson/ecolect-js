import { ResolvedIntent } from './ResolvedIntent';

/**
 *
 */
export interface ResolvedIntents {
	/**
	 * The best intent that matches.
	 */
	readonly best: ResolvedIntent | null;

	/**
	 * All of the matches.
	 */
	readonly matches: ReadonlyArray<ResolvedIntent>;
}
