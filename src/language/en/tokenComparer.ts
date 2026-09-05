import { TokenComparer } from '../../tokenization/index.js';

import { jaroWinklerSimilarity } from './algorithms/jaroWinkler.js';

/**
 * The lowest Jaro-Winkler similarity that counts as a fuzzy match.
 */
const SIMILARITY_THRESHOLD = 0.9;

/**
 * Get the fuzzy similarity of two words, or 0 if they are not similar
 * enough to count as a match.
 *
 * Jaro similarity is at most `(min / max + 2) / 3` for words of length `min`
 * and `max`, and the Winkler boost can raise that to at most 60% of the way
 * to 1. Words whose lengths differ by more than a factor of two can never
 * reach the threshold, so they are rejected without the full comparison.
 *
 * @param a -
 *   the first word
 * @param b -
 *   the second word
 * @returns
 *   the similarity scaled to a score, or 0 if not similar
 */
function fuzzyScore(a: string, b: string): number {
	const min = Math.min(a.length, b.length);
	const max = Math.max(a.length, b.length);
	if(min * 2 <= max) return 0;

	const d = jaroWinklerSimilarity(a, b);
	if(d > SIMILARITY_THRESHOLD) return d * 0.9;

	return 0;
}

export const tokenComparer: TokenComparer = {
	compare(a, b) {
		if(a.normalized === b.normalized) return 1.0;

		if(a.stemmed === b.stemmed) return 0.95;

		if(a.short || b.short) return 0;

		return fuzzyScore(a.normalized, b.normalized);
	},

	comparePartial(a, b) {
		if(a.normalized.indexOf(b.normalized) === 0) return 1.0;

		return fuzzyScore(a.normalized.substring(0, b.normalized.length), b.normalized);
	}
};
