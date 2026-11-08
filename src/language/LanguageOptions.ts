import type { AmbiguousSeparator, NumberSeparatorMode } from '../type-numbers/separators.js';

/**
 * Options that a language uses for every match that does not set them. They
 * change what the locale gives instead of replacing it, so they work with
 * every locale a match is read as.
 */
export interface LanguageOptions {
	/**
	 * How to read the separator that the locale does not use for fractions.
	 * See `numberSeparators` in the options of a match.
	 */
	readonly numberSeparators?: NumberSeparatorMode;

	/**
	 * How to read a separator that can both group digits and separate a
	 * fraction. See `ambiguousSeparator` in the options of a match.
	 */
	readonly ambiguousSeparator?: AmbiguousSeparator;
}
