/**
 * Extra words that a language should understand. Used to teach a language
 * the words of a certain domain without having to write a tokenizer.
 */
export interface Vocabulary {
	/**
	 * Words that mean the same thing, keyed by the word to treat them as.
	 * Both the input and the phrases are read as the key, so `clients` is
	 * matched by a phrase that uses `customers` and the other way around:
	 *
	 * ```javascript
	 * {
	 *   customers: [ 'clients', 'accounts' ]
	 * }
	 * ```
	 *
	 * Every word must be a single word in the language.
	 */
	synonyms?: Readonly<Record<string, readonly string[]>>;

	/**
	 * Words that may be left out of the input, such as `please`. Every word
	 * must be a single word in the language.
	 */
	skippable?: readonly string[];
}
