/**
 * The Unicode extension of a language tag, such as `-u-fw-mon` in
 * `en-US-u-fw-mon`. It holds settings such as the first day of the week.
 */
const UNICODE_EXTENSION = /-u(-[a-z0-9]{2,8})+/i;

/**
 * Get the locales that the JavaScript runtime reports for the user, with the
 * most specific one first.
 *
 * The default locale of `Intl` is first. It comes from the settings of the
 * operating system, so it can name the region and settings such as the first
 * day of the week. The languages of the browser come after it.
 *
 * @returns
 *   the locales as BCP 47 language tags, without duplicates
 */
export function runtimeLocales(): string[] {
	const locales = [ new Intl.DateTimeFormat().resolvedOptions().locale ];

	const browser = (globalThis as { navigator?: { language?: string; languages?: readonly string[] } }).navigator;
	if(browser) {
		locales.push(...(browser.languages ?? []));
		if(browser.language) locales.push(browser.language);
	}

	return [ ...new Set(locales.filter(locale => typeof locale === 'string' && locale !== '')) ];
}

/**
 * Pick the locale to read a language as from a list of locales of the user.
 *
 * The first locale in the language is used as it is. When no locale is in
 * the language, the region and the settings of the first locale are used
 * with the language. So an app in English for a user with `sv-SE` is read as
 * `en-SE`, with weeks that start on Monday.
 *
 * @param locales -
 *   the locales of the user as BCP 47 language tags, with the most wanted
 *   one first
 * @param language -
 *   the language to find a locale for, such as `en`. Without it the first
 *   locale is returned
 * @returns
 *   the locale, or `undefined` if the list has no valid locale
 */
export function pickLocale(locales: readonly string[], language?: string): string | undefined {
	const parsed: Intl.Locale[] = [];
	for(const locale of locales) {
		try {
			parsed.push(new Intl.Locale(locale.replaceAll('_', '-')));
		} catch{
			// A tag that is not valid is not a locale of the user
		}
	}

	if(parsed.length === 0) return undefined;
	if(typeof language === 'undefined') return parsed[0].toString();

	const inLanguage = parsed.find(locale => locale.language === language);
	if(inLanguage) return inLanguage.toString();

	const first = parsed[0];
	const region = first.region ? '-' + first.region : '';
	const extension = UNICODE_EXTENSION.exec(first.toString())?.[0] ?? '';
	return language + region + extension;
}

/**
 * Get the locale of the JavaScript runtime, to read a language with the
 * conventions of the user, such as the day that weeks start on.
 *
 * ```javascript
 * const matcher = dateValue().matcher(english(runtimeLocale('en')));
 * ```
 *
 * The locale is read each time, so a change of the settings of the user is
 * seen without a restart when the runtime reports it.
 *
 * @param language -
 *   the language to get a locale for, such as `en`. Without it the first
 *   locale of the runtime is returned
 * @returns
 *   the locale as a BCP 47 language tag, or the language itself if the
 *   runtime reports no locale. Without a language the fallback is `en-US`
 */
export function runtimeLocale(language?: string): string {
	return pickLocale(runtimeLocales(), language) ?? language ?? 'en-US';
}
