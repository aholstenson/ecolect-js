/**
 * Data for a token that can be enhanced with extra information.
 */
export interface TokenData {
	/**
	 * Raw text of the token.
	 */
	raw: string;

	/**
	 * The normalized version of the text.
	 */
	normalized: string;

	/**
	 * Text of token but stemmed.
	 */
	stemmed: string;

	/**
	 * If the token is considered short by the language.
	 */
	short: boolean;

	/**
	 * If the token is skippable.
	 */
	skippable: boolean;
}
