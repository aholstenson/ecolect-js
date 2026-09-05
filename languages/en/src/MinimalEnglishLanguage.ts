import { AbstractLanguage } from '@ecolect/language';

import { createRepeating } from './repeating.js';
import { tokenComparer } from './tokenComparer.js';
import { tokenizer } from './tokenizer.js';

/**
 * The locale English is read as when no other locale is given.
 */
export const DEFAULT_ENGLISH_LOCALE = 'en-US';

/*
 * Minimal implementation of English. Does not include any known graphs.
 */
export class MinimalEnglishLanguage extends AbstractLanguage {
	public readonly id = 'en';

	public constructor(locale: string = DEFAULT_ENGLISH_LOCALE) {
		super(tokenizer, tokenComparer, createRepeating, locale);
	}
}
