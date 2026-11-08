import type { Token, Tokenizer } from '../tokenization/index.js';

import type { Vocabulary } from './Vocabulary.js';

/**
 * The parts of a token that a synonym takes over from the word it is a
 * synonym for.
 */
interface Synonym {
	normalized: string;
	stemmed: string;
	short: boolean;
	skippable: boolean;
}

/**
 * Tokenize a single word of a vocabulary.
 *
 * @param tokenizer -
 *   tokenizer of the language
 * @param word -
 *   the word to tokenize
 * @param role -
 *   what the word is used as, for error reporting
 * @returns
 *   the single token the word became
 */
function tokenizeWord(tokenizer: Tokenizer, word: string, role: string): Token {
	const tokens = tokenizer(word);
	if(tokens.length !== 1) {
		throw new Error('Vocabulary ' + role + ' `' + word + '` must be a single word');
	}

	return tokens[0];
}

/**
 * Create a tokenizer that reads the given vocabulary. Words that are synonyms
 * are read as the word they are a synonym for, and words that the vocabulary
 * marks as skippable are marked so that they can be left out. A synonym of a
 * word that can be left out, such as `4` for `for`, can also be left out.
 *
 * @param tokenizer -
 *   tokenizer of the language the vocabulary extends
 * @param vocabulary -
 *   the vocabulary to read
 * @returns
 *   tokenizer that reads the vocabulary
 * @throws
 *   if a word is not a single word, or if a word is a synonym for two
 *   different words
 */
export function createVocabularyTokenizer(tokenizer: Tokenizer, vocabulary: Vocabulary): Tokenizer {
	const synonyms = new Map<string, Synonym>();
	for(const [ word, words ] of Object.entries(vocabulary.synonyms ?? {})) {
		const target = tokenizeWord(tokenizer, word, 'synonym');
		for(const synonym of words) {
			const token = tokenizeWord(tokenizer, synonym, 'synonym');
			const existing = synonyms.get(token.normalized);
			if(existing && existing.normalized !== target.normalized) {
				throw new Error('Vocabulary synonym `' + synonym + '` is a synonym for both `'
					+ existing.normalized + '` and `' + target.normalized + '`');
			}

			synonyms.set(token.normalized, {
				normalized: target.normalized,
				stemmed: target.stemmed,
				short: target.short,
				skippable: target.skippable
			});
		}
	}

	const skippable = new Set<string>();
	for(const word of vocabulary.skippable ?? []) {
		const token = tokenizeWord(tokenizer, word, 'skippable word');
		const synonym = synonyms.get(token.normalized);
		skippable.add(synonym ? synonym.normalized : token.normalized);
	}

	return input => {
		const tokens = tokenizer(input);
		for(const token of tokens) {
			const synonym = synonyms.get(token.normalized);
			if(synonym) {
				token.normalized = synonym.normalized;
				token.stemmed = synonym.stemmed;
				token.short = synonym.short;
				token.skippable = synonym.skippable;
			}

			if(skippable.has(token.normalized)) {
				token.skippable = true;
			}
		}

		return tokens;
	};
}
