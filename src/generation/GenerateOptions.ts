import { MatchOptions } from '../matching/index.js';

import { Casing } from './join.js';

/**
 * Options that can be used when generating a text.
 */
export interface GenerateOptions extends MatchOptions {
	/**
	 * Only generate text that means the same thing whenever it is read.
	 * Defaults to `true`, which is what a text that gets stored in a link
	 * needs, as `today` means another day tomorrow.
	 *
	 * Set this to `false` to also allow text that is read relative to the
	 * time it is read at.
	 */
	stable?: boolean;

	/**
	 * How to write the words of the phrase. Defaults to `phrase`, which
	 * keeps the words as the phrase was written.
	 */
	casing?: Casing;

	/**
	 * The number of texts to try before giving up. Defaults to 25. Each text
	 * that is tried is read back, so this puts a ceiling on the work a call
	 * does.
	 */
	maxCandidates?: number;
}
