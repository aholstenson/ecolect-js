import type { TokenComparer } from '../../tokenization/index.js';

import { jaroWinklerSimilarity } from './jaroWinkler.js';

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

/**
 * Get if one word is the other word with a prefix of two or more letters
 * added, such as `deactivate` and `activate`. Such a prefix often gives the
 * word the opposite meaning, so the words are not a spelling match even
 * though they are spelled almost the same. A prefix of one letter can be a
 * typo and is not counted.
 *
 * @param a -
 *   the first word
 * @param b -
 *   the second word
 * @returns
 *   `true` if the longer word is the shorter word with a prefix added
 */
function hasAddedPrefix(a: string, b: string): boolean {
	const [ shorter, longer ] = a.length <= b.length ? [ a, b ] : [ b, a ];
	return longer.length - shorter.length >= 2 && longer.endsWith(shorter);
}

/**
 * Options for a token comparer made with `createSimilarityTokenComparer`.
 */
export interface SimilarityTokenComparerOptions {
	/**
	 * Check if two words with the same stem are forms of the same word, such
	 * as `order` and `orders`. A stemmer can also give the same stem to words
	 * with different meanings, such as `universe` and `university`. Such words
	 * do not match. Without this check every two words with the same stem
	 * are forms of the same word.
	 *
	 * @param a -
	 *   the normalized text of the first word
	 * @param b -
	 *   the normalized text of the second word
	 * @returns
	 *   `true` if the words are forms of the same word
	 */
	isSameWord?: (a: string, b: string) => boolean;
}

/**
 * Create a token comparer that scores an exact word highest, a shared stem
 * slightly lower and otherwise falls back to how similar the words are
 * spelled. A word with an added prefix, such as `unlock` for `lock`, is not a
 * spelling match. It reads nothing but the token data, so every language
 * whose tokenizer fills in a stem can use it.
 *
 * @param options -
 *   options for the comparer
 * @returns
 *   the token comparer
 */
export function createSimilarityTokenComparer(options: SimilarityTokenComparerOptions = {}): TokenComparer {
	const isSameWord = options.isSameWord;

	return {
		compare(a, b) {
			if(a.normalized === b.normalized) return 1.0;

			if(a.stemmed === b.stemmed) {
				// Words with the same stem but different meanings do not match
				return ! isSameWord || isSameWord(a.normalized, b.normalized) ? 0.95 : 0;
			}

			if(a.short || b.short) return 0;

			if(hasAddedPrefix(a.normalized, b.normalized) || hasAddedPrefix(a.stemmed, b.stemmed)) {
				// Words such as `subscribe` and `unsubscribe` have different meanings
				return 0;
			}

			return fuzzyScore(a.normalized, b.normalized);
		},

		comparePartial(a, b) {
			if(a.normalized.indexOf(b.normalized) === 0) return 1.0;

			return fuzzyScore(a.normalized.substring(0, b.normalized.length), b.normalized);
		}
	};
}

/**
 * Token comparer made with `createSimilarityTokenComparer` without options,
 * so every two words with the same stem are forms of the same word.
 */
export const similarityTokenComparer: TokenComparer = createSimilarityTokenComparer();
