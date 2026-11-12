import type { DayOfWeek } from 'datetime-types';

import type {
	DateTimeOptions,
	DayName,
	DayPartHours
} from '../type-datetime/index.js';
import {
	DateOrder,
	MonthDayOrder,
	DEFAULT_DAY_PART_HOURS,
	parseDayPartTime,
	toDayName,
	toDayOfWeek,
	toWeekend,
	WeekParts
} from '../type-datetime/index.js';
import type { AmbiguousSeparator, NumberSeparatorMode } from '../type-numbers/separators.js';

import type { LanguageOptions, WeekNumbering } from './LanguageOptions.js';
import type { FirstWeekContainsDate } from './LocaleSettings.js';
import { resolveLocale } from './resolveLocale.js';
import { isWebKit, pickLocale, regionOfTimeZone, runtimeLocales } from './runtimeLocale.js';

/**
 * Where a setting of a language comes from.
 *
 * - `option` - the setting was given when the language was made
 * - `locale` - the setting is a convention of the locale
 * - `runtime` - the locale was read from the JavaScript runtime
 * - `timeZone` - the region was read from the time zone of the runtime
 * - `default` - nothing set it, so the default of the library is used
 */
export type SettingSource = 'option' | 'locale' | 'runtime' | 'timeZone' | 'default';

/**
 * The settings a language reads expressions with, as plain data. Every
 * setting has a value, and `sources` says where each one comes from.
 *
 * The object can be stored as JSON and given back to the function that makes
 * the language, such as `english`. Only the settings with the source `option`
 * are then used, so the other ones are read again from the locale.
 */
export interface ResolvedLanguageSettings {
	/**
	 * The identifier of the language, such as `en`.
	 */
	readonly language: string;

	/**
	 * The locale, as a BCP 47 language tag such as `en-SE`.
	 */
	readonly locale: string;

	/**
	 * The region of the locale, such as `SE`, if it has one.
	 */
	readonly region?: string;

	/**
	 * The day weeks start on.
	 */
	readonly weekStartsOn: DayName;

	/**
	 * How weeks are numbered. `iso` when the first week of the year is the
	 * first one with four days in it, and `first-day` when it is the week
	 * with January 1st in it. Not set for other values of
	 * `firstWeekContainsDate`.
	 */
	readonly weekNumbering?: WeekNumbering;

	/**
	 * The day of January that is always in the first week of the year.
	 */
	readonly firstWeekContainsDate: FirstWeekContainsDate;

	/**
	 * The days of the weekend.
	 */
	readonly weekend: readonly DayName[];

	/**
	 * The order of the fields in a numeric date.
	 */
	readonly dateOrder: DateOrder;

	/**
	 * The order of the month and the day in a numeric date without a year.
	 */
	readonly monthDayOrder: MonthDayOrder;

	/**
	 * The character that separates the fraction of a number.
	 */
	readonly decimalSeparator: string;

	/**
	 * The character that groups the digits of a number.
	 */
	readonly groupSeparator: string;

	/**
	 * How the separator that the locale does not use for fractions is read.
	 */
	readonly numberSeparators: NumberSeparatorMode;

	/**
	 * How a separator that can group digits and separate a fraction is read.
	 */
	readonly ambiguousSeparator: AmbiguousSeparator;

	/**
	 * The times of the named parts of the day.
	 */
	readonly dayParts: Readonly<DayPartHours>;

	/**
	 * The days that the parts of a week are taken from.
	 */
	readonly weekParts: WeekParts;

	/**
	 * Where each setting comes from.
	 */
	readonly sources: Readonly<Record<string, SettingSource>>;
}

/**
 * The options of a language after they are checked, with days as numbers.
 * These are the options that a match reads.
 */
export type NormalizedLanguageOptions = Omit<LanguageOptions, 'weekStartsOn' | 'weekend'> & {
	readonly weekStartsOn?: DayOfWeek;
	readonly weekend?: readonly DayOfWeek[];
};

/**
 * Where the locale and the region of a language come from.
 */
export interface LocaleOrigins {
	readonly locale: SettingSource;
	readonly region: SettingSource;
}

/**
 * The settings that only say which locale to use. They are not options of a
 * match, so a language does not keep them.
 */
const LOCALE_KEYS = new Set([ 'locale', 'region', 'regionFromTimeZone' ]);

/**
 * The settings that a language keeps and gives to each match.
 */
const OPTION_KEYS = [
	'numberSeparators',
	'ambiguousSeparator',
	'weekStartsOn',
	'firstWeekContainsDate',
	'weekend',
	'dateOrder',
	'monthDayOrder',
	'dayParts',
	'weekParts'
] as const;

/**
 * Get the settings that were given as options. Settings that come from
 * `language.settings` have `sources`, and then only the ones with the source
 * `option` are kept, so that the other ones are read again from the locale.
 *
 * @param input -
 *   the settings as given
 * @returns
 *   the settings to use
 */
function givenSettings(input: LanguageOptions): LanguageOptions {
	const sources = (input as { sources?: Record<string, SettingSource> }).sources;
	if(! sources || typeof sources !== 'object') return input;

	const result: Record<string, unknown> = {};
	for(const key of Object.keys(input)) {
		if(sources[key] === 'option') {
			result[key] = (input as Record<string, unknown>)[key];
		}
	}

	// A locale that was read from the runtime is read from it again
	if(sources.locale === 'runtime') {
		result.locale = 'auto';
	}

	// The numbering is stored under two names, the day of January is the exact one
	if(sources.firstWeekContainsDate === 'option') {
		delete result.weekNumbering;
	}

	return result;
}

/**
 * Check the settings of a language and turn them into the options that a
 * match reads. Days given as names become numbers.
 *
 * @param input -
 *   the settings as given
 * @returns
 *   the checked options
 * @throws
 *   if a setting has a value that is not valid
 */
export function normalizeLanguageOptions(input: LanguageOptions): NormalizedLanguageOptions {
	const given = givenSettings(input) as Record<string, unknown>;
	const result: Record<string, unknown> = {};

	for(const key of OPTION_KEYS) {
		if(typeof given[key] !== 'undefined' && given[key] !== null) {
			result[key] = given[key];
		}
	}

	if(typeof result.weekStartsOn !== 'undefined') {
		const day = toDayOfWeek(result.weekStartsOn);
		if(typeof day === 'undefined') {
			throw new Error('`weekStartsOn` must be a day of the week, such as `monday` or a number from 1 (Monday) to 7 (Sunday), got ' + String(result.weekStartsOn));
		}

		result.weekStartsOn = day;
	}

	if(typeof result.weekend !== 'undefined') {
		const weekend = toWeekend(result.weekend);
		if(! weekend) {
			throw new Error('`weekend` must be a list of days of the week, such as `saturday` and `sunday`');
		}

		result.weekend = Object.freeze(weekend);
	}

	const numbering = given.weekNumbering;
	if(typeof numbering !== 'undefined' && numbering !== null) {
		if(numbering !== 'iso' && numbering !== 'first-day') {
			throw new Error('`weekNumbering` must be `iso` or `first-day`, got ' + String(numbering));
		}

		result.firstWeekContainsDate ??= numbering === 'iso' ? 4 : 1;
	}

	const first = result.firstWeekContainsDate;
	if(typeof first !== 'undefined' && ! (Number.isInteger(first) && (first as number) >= 1 && (first as number) <= 7)) {
		throw new Error('`firstWeekContainsDate` must be a day of January from 1 to 7, got ' + String(first));
	}

	if(typeof result.dayParts !== 'undefined') {
		const parts = result.dayParts as Record<string, unknown>;
		for(const part of Object.keys(parts)) {
			if(! (part in DEFAULT_DAY_PART_HOURS)) {
				throw new Error('`dayParts` has no part named `' + part + '`');
			}

			if(! parseDayPartTime(parts[part])) {
				throw new Error('`dayParts.' + part + '` must be an hour from 0 to 23 or a time such as `11:30`, got ' + String(parts[part]));
			}
		}

		result.dayParts = Object.freeze({ ...parts });
	}

	if(typeof result.weekParts !== 'undefined'
		&& result.weekParts !== WeekParts.WorkWeek
		&& result.weekParts !== WeekParts.FullWeek) {
		throw new Error('`weekParts` must be `work-week` or `full-week`, got ' + String(result.weekParts));
	}

	return Object.freeze(result);
}

/**
 * Get if the settings say which locale to use, and not only how to read
 * expressions in it.
 *
 * @param input -
 *   the settings as given
 * @returns
 *   `true` if the settings name a locale or a region
 */
export function hasLocaleSettings(input: LanguageOptions): boolean {
	const given = givenSettings(input) as Record<string, unknown>;
	return Object.keys(given).some(key => LOCALE_KEYS.has(key) && typeof given[key] !== 'undefined');
}

/**
 * Find the locale that the settings of a language ask for.
 *
 * The locale `auto` is read from the JavaScript runtime. The region of it
 * can then come from the time zone, as `regionFromTimeZone` says. A `region`
 * in the settings replaces the region of the locale, so `en-US` with the
 * region `SE` is `en-SE`.
 *
 * @param language -
 *   the identifier of the language, such as `en`
 * @param current -
 *   the locale to use when the settings name none, and where it comes from
 * @param input -
 *   the settings as given
 * @returns
 *   the locale as a BCP 47 language tag, and where it and its region come
 *   from
 * @throws
 *   if the locale or the region is not valid
 */
export function resolveLanguageLocale(
	language: string,
	current: { locale: string; origins: LocaleOrigins },
	input: LanguageOptions
): { locale: string; origins: LocaleOrigins } {
	const given = givenSettings(input);

	let locale = current.locale;
	let localeSource = current.origins.locale;
	let regionSource: SettingSource = current.origins.region;

	if(given.locale === 'auto') {
		locale = pickLocale(runtimeLocales(), language) ?? current.locale;
		localeSource = 'runtime';
		regionSource = 'locale';

		const fromTimeZone = given.regionFromTimeZone ?? 'auto';
		if(typeof given.region === 'undefined' && (fromTimeZone === true || (fromTimeZone === 'auto' && isWebKit()))) {
			const region = regionOfTimeZone();
			if(region) {
				locale = withRegion(locale, region);
				regionSource = 'timeZone';
			}
		}
	} else if(typeof given.locale !== 'undefined') {
		locale = parseLocale(given.locale).toString();
		localeSource = 'option';
		regionSource = 'locale';
	}

	if(typeof given.region !== 'undefined') {
		locale = withRegion(locale, given.region);
		regionSource = 'option';
	}

	return { locale, origins: { locale: localeSource, region: regionSource } };
}

/**
 * Read a locale, with the POSIX form such as `en_GB` read as `en-GB`.
 *
 * @param locale -
 *   the locale as a language tag
 * @returns
 *   the locale
 * @throws
 *   if the locale is not a valid BCP 47 language tag
 */
function parseLocale(locale: string): Intl.Locale {
	try {
		return new Intl.Locale(String(locale).replaceAll('_', '-'));
	} catch{
		throw new Error('`' + locale + '` is not a valid locale, use a BCP 47 language tag such as `en-US`');
	}
}

/**
 * Replace the region of a locale, so that `en-US` with the region `SE` is
 * `en-SE`. An extension of the locale, such as `-u-fw-mon`, is kept.
 *
 * @param locale -
 *   the locale as a BCP 47 language tag
 * @param region -
 *   the region, as two letters such as `SE` or three digits such as `419`
 * @returns
 *   the locale in the region
 * @throws
 *   if the region is not a valid region code
 */
export function withRegion(locale: string, region: string): string {
	if(typeof region !== 'string' || ! /^([a-z]{2}|[0-9]{3})$/i.test(region)) {
		throw new Error('`' + region + '` is not a valid region, use a code of two letters such as `SE`');
	}

	return new Intl.Locale(parseLocale(locale).toString(), { region: region.toUpperCase() }).toString();
}

/**
 * Describe the settings a language reads expressions with.
 *
 * @param language -
 *   the identifier of the language
 * @param locale -
 *   the locale of the language
 * @param options -
 *   the checked options of the language
 * @param origins -
 *   where the locale and the region come from
 * @returns
 *   every setting and where it comes from, as frozen plain data
 */
export function resolveLanguageSettings(
	language: string,
	locale: string,
	options: NormalizedLanguageOptions,
	origins: LocaleOrigins
): ResolvedLanguageSettings {
	const conventions = resolveLocale(locale);
	const region = parseLocale(locale).maximize().region;

	const sources: Record<string, SettingSource> = {
		locale: origins.locale
	};

	if(region) {
		sources.region = origins.region;
	}

	const pick = <K extends keyof NormalizedLanguageOptions & keyof DateTimeOptions, V>(
		key: K,
		fallback: V,
		fallbackSource: SettingSource
	): NonNullable<NormalizedLanguageOptions[K]> | V => {
		const value = options[key];
		sources[key] = typeof value === 'undefined' ? fallbackSource : 'option';
		return (value ?? fallback);
	};

	const weekStartsOn = pick('weekStartsOn', conventions.weekStartsOn, 'locale');
	const firstWeekContainsDate = pick('firstWeekContainsDate', conventions.firstWeekContainsDate, 'locale');
	const weekend = pick('weekend', conventions.weekend, 'locale');

	/*
	 * A date order of the language also decides the order of the month and
	 * the day, as it does for a match.
	 */
	const dateOrder = pick('dateOrder', conventions.dateOrder, 'locale');
	let monthDayOrder = pick('monthDayOrder', conventions.monthDayOrder, 'locale');
	if(typeof options.dateOrder !== 'undefined' && typeof options.monthDayOrder === 'undefined') {
		monthDayOrder = dateOrder === DateOrder.DayMonthYear ? MonthDayOrder.DayMonth : MonthDayOrder.MonthDay;
		sources.monthDayOrder = 'option';
	}

	const weekParts = pick('weekParts', WeekParts.WorkWeek, 'default');

	sources.dayParts = typeof options.dayParts === 'undefined' ? 'default' : 'option';
	sources.numberSeparators = typeof options.numberSeparators === 'undefined' ? 'default' : 'option';
	sources.ambiguousSeparator = typeof options.ambiguousSeparator === 'undefined' ? 'default' : 'option';
	sources.decimalSeparator = 'locale';
	sources.groupSeparator = 'locale';

	const weekNumbering: WeekNumbering | undefined = firstWeekContainsDate === 4
		? 'iso'
		: (firstWeekContainsDate === 1 ? 'first-day' : undefined);
	if(weekNumbering) {
		sources.weekNumbering = sources.firstWeekContainsDate;
	}

	return Object.freeze({
		language,
		locale,
		...(region ? { region } : {}),
		weekStartsOn: toDayName(weekStartsOn),
		...(weekNumbering ? { weekNumbering } : {}),
		firstWeekContainsDate,
		weekend: Object.freeze(weekend.map(toDayName)),
		dateOrder,
		monthDayOrder,
		decimalSeparator: conventions.decimalSeparator,
		groupSeparator: conventions.groupSeparator,
		numberSeparators: options.numberSeparators ?? 'auto',
		ambiguousSeparator: options.ambiguousSeparator ?? 'group',
		dayParts: Object.freeze({ ...DEFAULT_DAY_PART_HOURS, ...options.dayParts }),
		weekParts,
		sources: Object.freeze(sources)
	});
}
