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

/**
 * The part of `Intl.Locale` that reports the time zones of a region. This is
 * not yet in the type definitions of the ES2022 library this project targets.
 */
interface LocaleWithTimeZones {
	getTimeZones?: () => string[] | undefined;
	timeZones?: string[];
}

/**
 * Region codes that are another name for a region, which would make a time
 * zone look as if two regions use it.
 */
const REGION_ALIASES = new Set([ 'UK' ]);

let regionsByTimeZone: Map<string, string | null> | undefined;

/**
 * Read the regions of every time zone from `Intl`. A time zone that more
 * than one region uses maps to `null`, as it does not name one region.
 *
 * @returns
 *   the region of each time zone
 */
function readRegionsByTimeZone(): Map<string, string | null> {
	const result = new Map<string, string | null>();

	// `Intl` has no list of regions, so every code of two letters is tried
	for(let first = 65; first <= 90; first++) {
		for(let second = 65; second <= 90; second++) {
			const region = String.fromCharCode(first, second);
			if(REGION_ALIASES.has(region)) continue;

			let zones: string[] | undefined;
			try {
				const locale = new Intl.Locale('und-' + region) as Intl.Locale & LocaleWithTimeZones;
				zones = locale.getTimeZones ? locale.getTimeZones() : locale.timeZones;
			} catch{
				zones = undefined;
			}

			for(const zone of zones ?? []) {
				result.set(zone, result.has(zone) && result.get(zone) !== region ? null : region);
			}
		}
	}

	return result;
}

/**
 * Get the region that a time zone is in, such as `SE` for
 * `Europe/Stockholm`. The regions are read from `Intl`, so no time zone data
 * is bundled. The first call reads all of them and later calls are fast.
 *
 * This is a way to find the region of the user when the runtime does not
 * report it. It is a guess, as a person on a trip is in a time zone of a
 * region that is not their own.
 *
 * @param timeZone -
 *   the time zone, as an IANA name. Without it the time zone of the runtime
 *   is used
 * @returns
 *   the region, or `undefined` if the time zone is not known, is not in one
 *   region only, or the runtime has no data for time zones
 */
export function regionOfTimeZone(timeZone?: string): string | undefined {
	const zone = timeZone ?? new Intl.DateTimeFormat().resolvedOptions().timeZone;
	if(! zone) return undefined;

	regionsByTimeZone ??= readRegionsByTimeZone();
	return regionsByTimeZone.get(zone) ?? undefined;
}

/**
 * Get if the JavaScript runtime is WebKit, as in Safari and in the web views
 * of macOS and iOS. WebKit reports the language of the user without the
 * region they have set, so the region must come from somewhere else.
 *
 * @returns
 *   `true` if the runtime is a browser from Apple
 */
export function isWebKit(): boolean {
	const browser = (globalThis as { navigator?: { vendor?: string } }).navigator;
	return typeof browser?.vendor === 'string' && browser.vendor.startsWith('Apple');
}
