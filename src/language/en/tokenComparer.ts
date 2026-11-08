import type { TokenComparer } from '../../tokenization/index.js';
import { createSimilarityTokenComparer } from '../algorithms/similarityTokenComparer.js';

/**
 * Endings that make another form of an English word, such as the plural
 * `orders`, the past `ordered` and `ordering`. The endings `y`, `ies`, `ied`
 * and `e` cover changes such as `city` and `cities` or `make` and `making`.
 * Endings that make a new word, such as `ity` in `university`, `ation` in
 * `organization` or `er` in `computer`, are not in the list.
 */
const INFLECTION_ENDINGS = new Set([
	'', 's', 'es', 'ies', 'e', 'd', 'ed', 'ied', 'ing', 'y'
]);

/**
 * Check if the end of a word, after the part it shares with another word, is
 * an inflection ending. A doubled consonant before the ending is part of the
 * ending, as in `running` and `stopped`.
 *
 * @param ending -
 *   the end of the word
 * @param previous -
 *   the letter before the end
 * @returns
 *   `true` if the end is an inflection ending
 */
function isInflectionEnding(ending: string, previous: string | undefined): boolean {
	if(INFLECTION_ENDINGS.has(ending)) return true;

	return ending.length > 1 && ending[0] === previous && INFLECTION_ENDINGS.has(ending.substring(1));
}

/**
 * Check if two English words with the same stem are forms of the same word.
 * This is so if each word is the part they share followed by an inflection
 * ending. The Porter stemmer also gives the same stem to words with
 * different meanings, such as `universe` and `university` or `busy` and
 * `business`, and these are not forms of the same word.
 *
 * @param a -
 *   the first word
 * @param b -
 *   the second word
 * @returns
 *   `true` if the words are forms of the same word
 */
function isSameEnglishWord(a: string, b: string): boolean {
	let shared = 0;
	while(shared < a.length && shared < b.length && a[shared] === b[shared]) {
		shared++;
	}

	const previous = shared > 0 ? a[shared - 1] : undefined;
	return isInflectionEnding(a.substring(shared), previous)
		&& isInflectionEnding(b.substring(shared), previous);
}

/**
 * Token comparer for English. English words are compared on their exact
 * spelling, their Porter stem and how similar they are spelled. Words with
 * the same stem only match if they are forms of the same word.
 */
export const tokenComparer: TokenComparer = createSimilarityTokenComparer({
	isSameWord: isSameEnglishWord
});
