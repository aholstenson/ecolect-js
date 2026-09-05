import { DateOrder } from '@ecolect/type-datetime';

import { FirstWeekContainsDate, LocaleSettings, WeekStartsOn } from './LocaleSettings.js';

/**
 * The regions where the first week of the year is the first one with at
 * least four days in it, which is the system ISO 8601 describes. Every other
 * region counts the week with January 1st in it as the first week.
 *
 * `Intl` used to report this as `minimalDays` but no longer does, so the
 * regions are listed here. They come from the week data of CLDR.
 */
const FIRST_WEEK_NEEDS_FOUR_DAYS = new Set([
	'AD', 'AN', 'AT', 'AX', 'BE', 'BG', 'CH', 'CZ', 'DE', 'DK', 'EE', 'ES',
	'FI', 'FJ', 'FO', 'FR', 'GB', 'GF', 'GG', 'GI', 'GP', 'GR', 'HU', 'IE',
	'IM', 'IS', 'IT', 'JE', 'LI', 'LT', 'LU', 'MC', 'MQ', 'NL', 'NO', 'PL',
	'PT', 'RE', 'RU', 'SE', 'SJ', 'SK', 'SM', 'VA'
]);

/**
 * Date used to read the order of the fields in a numeric date. Only the order
 * of the fields is read, so the date itself does not matter.
 */
const REFERENCE_DATE = new Date(2017, 0, 2);

/**
 * Number used to read the separators of a formatted number. It has a fraction
 * and enough digits to be grouped.
 */
const REFERENCE_NUMBER = 12345.6;

/**
 * The part of `Intl.Locale` that reports week data. This is not yet in the
 * type definitions of the ES2022 library this project targets.
 */
interface LocaleWithWeekInfo {
	getWeekInfo?: () => { firstDay: number };
	weekInfo?: { firstDay: number };
}

const cache = new Map<string, LocaleSettings>();

/**
 * Get the conventions of a locale, such as `en-GB` or `sv-SE`. The settings
 * are read from `Intl`, so no locale data is bundled.
 *
 * The result is cached, so the same tag always returns the same object.
 *
 * @param locale -
 *   the locale to read, as a BCP 47 language tag
 * @returns
 *   the settings of the locale
 */
export function resolveLocale(locale: string): LocaleSettings {
	const cached = cache.get(locale);
	if(cached) {
		return cached;
	}

	const resolved = readLocale(locale);
	cache.set(locale, resolved);
	return resolved;
}

/**
 * Read the settings of a locale.
 *
 * @param locale -
 *   the locale to read, as a BCP 47 language tag
 * @returns
 *   the settings of the locale
 */
function readLocale(locale: string): LocaleSettings {
	let parsed;
	try {
		parsed = new Intl.Locale(locale);
	} catch{
		throw new Error('`' + locale + '` is not a valid locale');
	}

	return {
		dateOrder: readDateOrder(locale),
		weekStartsOn: readWeekStartsOn(parsed),
		firstWeekContainsDate: readFirstWeekContainsDate(parsed),
		...readSeparators(locale)
	};
}

/**
 * Read the order of the fields in a numeric date by formatting a date in its
 * shortest form and looking at where the fields end up.
 *
 * @param locale -
 *   the locale to read
 * @returns
 *   the order of the fields
 */
function readDateOrder(locale: string): DateOrder {
	const fields = new Intl.DateTimeFormat(locale, { dateStyle: 'short' })
		.formatToParts(REFERENCE_DATE)
		.map(part => part.type)
		.filter(type => type === 'year' || type === 'month' || type === 'day');

	if(fields[0] === 'year') {
		return DateOrder.YearMonthDay;
	}

	const day = fields.indexOf('day');
	const month = fields.indexOf('month');
	if(day >= 0 && month >= 0 && day < month) {
		return DateOrder.DayMonthYear;
	}

	return DateOrder.MonthDayYear;
}

/**
 * Read the day that weeks start on. `Intl` counts Monday as 1 and Sunday as
 * 7, while the options count Sunday as 0.
 *
 * @param locale -
 *   the locale to read
 * @returns
 *   the day weeks start on
 */
function readWeekStartsOn(locale: Intl.Locale): WeekStartsOn {
	const withWeekInfo = locale as Intl.Locale & LocaleWithWeekInfo;
	const weekInfo = withWeekInfo.getWeekInfo
		? withWeekInfo.getWeekInfo()
		: withWeekInfo.weekInfo;

	return (weekInfo?.firstDay ?? 7) % 7;
}

/**
 * Read the day of January that is always in the first week of the year.
 *
 * @param locale -
 *   the locale to read
 * @returns
 *   `4` for regions that use the ISO week system and `1` for the rest
 */
function readFirstWeekContainsDate(locale: Intl.Locale): FirstWeekContainsDate {
	const region = locale.maximize().region;
	return region && FIRST_WEEK_NEEDS_FOUR_DAYS.has(region) ? 4 : 1;
}

/**
 * Read the separators of a number by formatting a number that has both a
 * fraction and a group of digits.
 *
 * @param locale -
 *   the locale to read
 * @returns
 *   the decimal and the group separator
 */
function readSeparators(locale: string) {
	const parts = new Intl.NumberFormat(locale).formatToParts(REFERENCE_NUMBER);

	return {
		decimalSeparator: parts.find(part => part.type === 'decimal')?.value ?? '.',
		groupSeparator: parts.find(part => part.type === 'group')?.value ?? ''
	};
}
