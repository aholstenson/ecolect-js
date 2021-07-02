import { TokenData } from './TokenData';

export interface Token extends TokenData {
	/**
	 * The start position of the token.
	 */
	start: number;

	/**
	 * The stop position of the token.
	 */
	stop: number;

	/**
	 * If the token represents punctuation.
	 */
	punctuation: boolean;
}
