import { ResolvedIntent } from './ResolvedIntent';

/**
 *
 */
export interface ResolvedIntents<Values extends object> {
	/**
	 * The best intent that matches.
	 */
	readonly best: ResolvedIntent<Values> | null;

	/**
	 * All of the matches.
	 */
	readonly matches: ReadonlyArray<ResolvedIntent<Values>>;
}
