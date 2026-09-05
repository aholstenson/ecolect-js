import { AbstractLanguage } from '../index.js';

import { createRepeating } from './repeating.js';
import { tokenComparer } from './tokenComparer.js';
import { tokenizer } from './tokenizer.js';

/**
 * The locale Swedish is read as when no other locale is given.
 */
export const DEFAULT_SWEDISH_LOCALE = 'sv-SE';

/*
 * Minimal implementation of Swedish. Does not include any known graphs.
 */
export class MinimalSwedishLanguage extends AbstractLanguage {
	public readonly id = 'sv';

	public constructor(locale: string = DEFAULT_SWEDISH_LOCALE) {
		super(tokenizer, tokenComparer, createRepeating, locale);
	}
}
