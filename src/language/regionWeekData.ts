import { DayOfWeek } from 'datetime-types';

import type { WeekStartsOn } from './LocaleSettings.js';

/**
 * The regions where weeks do not start on Monday, by the day they start on.
 * These are used when `Intl` has no week data, which is the case in some
 * JavaScript engines. They come from the week data of CLDR 48, and every
 * other region starts weeks on Monday.
 */
const WEEK_STARTS_ON_FRIDAY = new Set([ 'MV' ]);

const WEEK_STARTS_ON_SATURDAY = new Set([
	'AF', 'BH', 'DJ', 'DZ', 'EG', 'IQ', 'IR', 'JO', 'KW', 'LY', 'OM', 'QA',
	'SD', 'SY'
]);

const WEEK_STARTS_ON_SUNDAY = new Set([
	'AG', 'AS', 'BD', 'BR', 'BS', 'BT', 'BW', 'BZ', 'CA', 'CO', 'DM', 'DO',
	'ET', 'GT', 'GU', 'HK', 'HN', 'ID', 'IL', 'IN', 'IS', 'JM', 'JP', 'KE',
	'KH', 'KR', 'LA', 'MH', 'MM', 'MO', 'MT', 'MX', 'MZ', 'NI', 'NP', 'PA',
	'PE', 'PH', 'PK', 'PR', 'PT', 'PY', 'SA', 'SG', 'SV', 'TH', 'TT', 'TW',
	'UM', 'US', 'VE', 'VI', 'WS', 'YE', 'ZA', 'ZW'
]);

/**
 * Get the day that weeks start on in the region of a locale, from the week
 * data of CLDR.
 *
 * @param locale -
 *   the locale to read
 * @returns
 *   the day weeks start on
 */
export function weekStartsOnInRegion(locale: Intl.Locale): WeekStartsOn {
	const region = locale.maximize().region;
	if(! region) return DayOfWeek.MONDAY;

	if(WEEK_STARTS_ON_SUNDAY.has(region)) return DayOfWeek.SUNDAY;
	if(WEEK_STARTS_ON_SATURDAY.has(region)) return DayOfWeek.SATURDAY;
	if(WEEK_STARTS_ON_FRIDAY.has(region)) return DayOfWeek.FRIDAY;

	return DayOfWeek.MONDAY;
}
