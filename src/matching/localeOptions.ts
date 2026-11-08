import type { Language } from '../language/index.js';
import { resolveLocale } from '../language/index.js';

import type { MatchAllOptions } from './MatchAllOptions.js';
import type { Matcher } from './Matcher.js';
import type { MatchOptions } from './MatchOptions.js';

const cache = new Map<string, MatchOptions>();

/**
 * Get the match options that a locale describes. The result is cached, so the
 * same locale always returns the same object.
 *
 * @param locale -
 *   the locale to read, as a BCP 47 language tag
 * @returns
 *   options with the conventions of the locale
 */
export function localeMatchOptions(locale: string): MatchOptions {
	const cached = cache.get(locale);
	if(cached) {
		return cached;
	}

	const settings = resolveLocale(locale);
	const options: MatchOptions = {
		dateOrder: settings.dateOrder,
		monthDayOrder: settings.monthDayOrder,
		weekStartsOn: settings.weekStartsOn,
		firstWeekContainsDate: settings.firstWeekContainsDate
	};

	cache.set(locale, options);
	return options;
}

/**
 * Fill in the conventions that the options of a match leave out. A locale set
 * in the options decides them, and the locale of the language decides them
 * when the options name none. Options set directly are left as they are.
 *
 * @param languageLocale -
 *   the locale of the language the matcher was created for
 * @param options -
 *   the options of the match, which are changed in place
 * @returns
 *   the options of the match
 */
export function applyLocale<O extends MatchOptions>(languageLocale: string, options: O): O {
	const defaults = localeMatchOptions(options.locale ?? languageLocale);

	/*
	 * A date order set directly also decides the order of the month and the
	 * day, so the locale only decides that order when it decides both.
	 */
	if(typeof options.dateOrder === 'undefined') {
		options.dateOrder = defaults.dateOrder;

		if(typeof options.monthDayOrder === 'undefined') {
			options.monthDayOrder = defaults.monthDayOrder;
		}
	}

	if(typeof options.weekStartsOn === 'undefined') {
		options.weekStartsOn = defaults.weekStartsOn;
	}

	if(typeof options.firstWeekContainsDate === 'undefined') {
		options.firstWeekContainsDate = defaults.firstWeekContainsDate;
	}

	return options;
}

/**
 * Matcher that reads the conventions of a locale for anything the options of
 * a match leave out. An invalid locale rejects the promise of the match, it
 * does not throw.
 */
class LocaleAwareMatcher<V> implements Matcher<V> {
	private readonly locale: string;
	private readonly matcher: Matcher<V>;

	public constructor(locale: string, matcher: Matcher<V>) {
		this.locale = locale;
		this.matcher = matcher;
	}

	public async match(expression: string, options: MatchOptions = {}): Promise<V | null> {
		return this.matcher.match(expression, this.resolve(options));
	}

	public async matchAll(expression: string, options: MatchAllOptions = {}): Promise<V[]> {
		return this.matcher.matchAll(expression, this.resolve(options));
	}

	public async matchPartial(expression: string, options: MatchOptions = {}): Promise<V[]> {
		return this.matcher.matchPartial(expression, this.resolve(options));
	}

	/**
	 * Copy the options of a match and fill in the conventions they leave out.
	 * The copy keeps the options of the caller unchanged.
	 *
	 * @param options -
	 *   the options of the match
	 * @returns
	 *   options that name every convention
	 */
	private resolve<O extends MatchOptions>(options: O): O {
		return applyLocale(this.locale, { ...options });
	}
}

/**
 * Wrap a matcher so that it reads expressions with the conventions of the
 * locale of a language, such as the order of the fields in a numeric date.
 *
 * @param language -
 *   the language the matcher was created for
 * @param matcher -
 *   the matcher to wrap
 * @returns
 *   a matcher that reads the conventions of the language
 */
export function localeAwareMatcher<V>(language: Language, matcher: Matcher<V>): Matcher<V> {
	return new LocaleAwareMatcher(language.locale, matcher);
}
