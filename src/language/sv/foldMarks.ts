/**
 * Marks on letters, such as the ring of `å` and the dots of `ä` and `ö`, once
 * a word is decomposed with NFD.
 */
const MARKS = /\p{M}/gu;

/**
 * Remove the marks from the letters of a text, so that `sätt på` is
 * `satt pa`. Swedish is often typed this way on a keyboard without `å`, `ä`
 * and `ö`.
 *
 * @param text -
 *   the text
 * @returns
 *   the text without marks, in NFC
 */
export function foldMarks(text: string): string {
	return text.normalize('NFD').replace(MARKS, '').normalize();
}
