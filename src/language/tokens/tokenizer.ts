
/**
 * Input as given to a tokenizer.
 */
export interface TokenizerInput {
	/**
	 * The raw text to tokenize.
	 */
	raw: string;

	/**
	 * The index in the source at which the first character in the raw text
	 * was pulled from.
	 */
	start: number;

	/**
	 * The index in the source at which the last character in the raw text
	 * was pulled from.
	 */
	stop: number;
}

/**
 * Tokenizer of input. A tokenizer is responsible for creating tokens, either
 * full ones or simple token data.
 */
export type Tokenizer<T> = (input: TokenizerInput) => T[];
