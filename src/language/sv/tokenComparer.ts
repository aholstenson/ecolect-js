import type { Token, TokenComparer } from '../../tokenization/index.js';
import { similarityTokenComparer } from '../algorithms/similarityTokenComparer.js';

import { foldMarks as fold } from './foldMarks.js';

/**
 * How much of the score a word keeps when it only matches with the marks
 * left out, such as `pa` for `på`. The word written with the marks always
 * scores higher.
 */
const FOLDED_SCORE = 0.9;

/**
 * Get a token with the marks removed from its letters.
 *
 * @param token -
 *   the token
 * @returns
 *   copy of the token without marks
 */
function foldToken(token: Token): Token {
	return {
		...token,
		normalized: fold(token.normalized),
		stemmed: fold(token.stemmed)
	};
}

/**
 * Get if a word of the expression can be compared to a word of a graph with
 * the marks left out. This is so when the word of the graph has marks and
 * the word of the expression has none, as when the keyboard has no `å`, `ä`
 * or `ö`. A word typed with marks is read as it is, so `sätt` does not match
 * `satt`.
 *
 * @param graphToken -
 *   the word of the graph
 * @param inputToken -
 *   the word of the expression
 * @returns
 *   `true` if the words can be compared without marks
 */
function canFold(graphToken: Token, inputToken: Token): boolean {
	return fold(graphToken.normalized) !== graphToken.normalized
		&& fold(inputToken.normalized) === inputToken.normalized;
}

/**
 * Token comparer for Swedish. Swedish words are compared on their exact
 * spelling, their Snowball stem and how similar they are spelled, none of
 * which needs anything Swedish specific.
 *
 * A word typed without `å`, `ä` and `ö`, such as `pa` for `på`, also matches,
 * but with a lower score than the word with the letters.
 */
export const tokenComparer: TokenComparer = {
	compare(a, b) {
		const score = similarityTokenComparer.compare(a, b);
		if(score > 0 || ! canFold(a, b)) return score;

		return similarityTokenComparer.compare(foldToken(a), b) * FOLDED_SCORE;
	},

	comparePartial(a, b) {
		const score = similarityTokenComparer.comparePartial(a, b);
		if(score > 0 || ! canFold(a, b)) return score;

		return similarityTokenComparer.comparePartial(foldToken(a), b) * FOLDED_SCORE;
	}
};
