import type { Language, LanguageOptions } from '../language/index.js';
import { resolveLocale } from '../language/index.js';
import { resolveNumberSeparators } from '../type-numbers/separators.js';

import type { MatchAllOptions } from './MatchAllOptions.js';
import type { Matcher } from './Matcher.js';
import type { MatchOptions } from './MatchOptions.js';

const cache = new Map<string, MatchOptions>();

/**
 * Get the match options that a locale describes. The result is cached, so the
 * same locale always returns the same object. The object is frozen, as every
 * match with the locale uses it. Copy it to make options of your own.
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
	const options: MatchOptions = Object.freeze({
		dateOrder: settings.dateOrder,
		monthDayOrder: settings.monthDayOrder,
		weekStartsOn: settings.weekStartsOn,
		firstWeekContainsDate: settings.firstWeekContainsDate,
		decimalSeparator: settings.decimalSeparator,
		groupSeparator: settings.groupSeparator
	});

	cache.set(locale, options);
	return options;
}

/**
 * The options of a language that are settings of the user. A match that does
 * not set one of these uses the one of the language.
 */
const USER_SETTINGS = [
	'weekStartsOn',
	'firstWeekContainsDate',
	'dateOrder',
	'monthDayOrder',
	'dayParts',
	'weekParts'
] as const;

/**
 * Fill in the conventions that the options of a match leave out. A locale set
 * in the options decides them, and the locale of the language decides them
 * when the options name none. Options set directly are left as they are, and
 * the date and time settings of the language win over both locales.
 *
 * The separators of numbers are always set as lists. The options of the
 * language decide `numberSeparators` and `ambiguousSeparator` when the
 * options of the match do not, and these then decide which separators the
 * locale adds.
 *
 * @param languageLocale -
 *   the locale of the language the matcher was created for
 * @param options -
 *   the options of the match, which are changed in place
 * @param languageOptions -
 *   the options of the language the matcher was created for
 * @returns
 *   the options of the match
 */
export function applyLocale<O extends MatchOptions>(
	languageLocale: string,
	options: O,
	languageOptions: LanguageOptions = {}
): O {
	/*
	 * The date and time settings of the language are settings of the user,
	 * so they are used as if the match set them and win over the locale.
	 */
	for(const key of USER_SETTINGS) {
		if(typeof options[key] === 'undefined' && typeof languageOptions[key] !== 'undefined') {
			(options as MatchOptions)[key] = languageOptions[key] as never;
		}
	}

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

	if(typeof options.numberSeparators === 'undefined' && languageOptions.numberSeparators) {
		options.numberSeparators = languageOptions.numberSeparators;
	}

	if(typeof options.ambiguousSeparator === 'undefined' && languageOptions.ambiguousSeparator) {
		options.ambiguousSeparator = languageOptions.ambiguousSeparator;
	}

	/*
	 * The separators are set as lists, so a match that is read again with
	 * these options, such as a value within a phrase, gets the same ones.
	 */
	const separators = resolveNumberSeparators(resolveLocale(options.locale ?? languageLocale), options);
	options.decimalSeparator = separators.decimal;
	options.groupSeparator = separators.group;
	options.ambiguousSeparator = separators.ambiguous;

	return options;
}

/**
 * Check that the week settings of the options are days that exist.
 * `weekStartsOn` is a `DayOfWeek` from 1 for Monday to 7 for Sunday. Earlier
 * versions counted Sunday as 0, so 0 is also read as Sunday.
 * `firstWeekContainsDate` is a day of January from 1 to 7.
 *
 * @param options -
 *   the options to check
 * @throws
 *   if a week setting is not a valid day
 */
function checkWeekOptions(options: MatchOptions): void {
	const weekStartsOn = options.weekStartsOn as number | undefined;
	if(typeof weekStartsOn !== 'undefined'
		&& ! (Number.isInteger(weekStartsOn) && weekStartsOn >= 0 && weekStartsOn <= 7)) {
		throw new Error('`weekStartsOn` must be a day of the week from 1 (Monday) to 7 (Sunday), got ' + weekStartsOn);
	}

	const firstWeekContainsDate = options.firstWeekContainsDate as number | undefined;
	if(typeof firstWeekContainsDate !== 'undefined'
		&& ! (Number.isInteger(firstWeekContainsDate) && firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
		throw new Error('`firstWeekContainsDate` must be a day of January from 1 to 7, got ' + firstWeekContainsDate);
	}
}

/**
 * Matcher that reads the conventions of a locale for anything the options of
 * a match leave out. An invalid locale or week setting rejects the promise of
 * the match, it does not throw.
 */
class LocaleAwareMatcher<V> implements Matcher<V> {
	private readonly locale: string;
	private readonly languageOptions: LanguageOptions;
	private readonly matcher: Matcher<V>;

	public constructor(locale: string, languageOptions: LanguageOptions, matcher: Matcher<V>) {
		this.locale = locale;
		this.languageOptions = languageOptions;
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
	 * The copy keeps the options of the caller unchanged. The week settings
	 * are checked, so that a match with a day that does not exist rejects.
	 *
	 * @param options -
	 *   the options of the match
	 * @returns
	 *   options that name every convention
	 */
	private resolve<O extends MatchOptions>(options: O): O {
		const resolved = applyLocale(this.locale, { ...options }, this.languageOptions);
		checkWeekOptions(resolved);
		return resolved;
	}
}

/**
 * Wrap a matcher so that it reads expressions with the conventions of the
 * locale of a language, such as the order of the fields in a numeric date.
 * The options of the language are used when a match does not set them.
 *
 * @param language -
 *   the language the matcher was created for
 * @param matcher -
 *   the matcher to wrap
 * @returns
 *   a matcher that reads the conventions of the language
 */
export function localeAwareMatcher<V>(language: Language, matcher: Matcher<V>): Matcher<V> {
	return new LocaleAwareMatcher(language.locale, language.options ?? {}, matcher);
}
