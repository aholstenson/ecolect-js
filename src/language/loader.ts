import type { Language } from './Language.js';

/**
 * The languages that ship with Ecolect, as functions that load one on demand.
 *
 * Every entry is a literal dynamic import, which is what a bundler needs to
 * see to put each language in a chunk of its own. A caller that only ever
 * loads English never downloads the others.
 *
 * Import the language directly, as `ecolect/language/en`, when the language
 * is known when the code is written and loading it up front is fine.
 */
export const languages = {
	en: () => import('./en/index.js').then(module => module.en),
	sv: () => import('./sv/index.js').then(module => module.sv)
} satisfies Record<string, () => Promise<Language>>;

/**
 * The identifier of a language that ships with Ecolect.
 */
export type LanguageId = keyof typeof languages;

/**
 * The identifiers of every language that ships with Ecolect.
 */
export const languageIds = Object.keys(languages) as LanguageId[];

/**
 * Get if the given identifier belongs to a language that ships with Ecolect.
 *
 * @param id -
 *   the identifier to check
 * @returns
 *   `true` if {@link loadLanguage} can load the identifier
 */
export function isLanguageId(id: string): id is LanguageId {
	return Object.hasOwn(languages, id);
}

/**
 * Load one of the languages that ship with Ecolect.
 *
 * @param id -
 *   the identifier of the language, such as `en`
 * @returns
 *   promise that resolves to the language
 */
export function loadLanguage(id: LanguageId): Promise<Language> {
	return languages[id]();
}
