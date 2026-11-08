import { DayOfWeek } from 'datetime-types';

import { weekStartsOnInRegion } from '../../src/language/regionWeekData.js';

/**
 * The regions that `Intl` knows a name for. Only these have week data.
 *
 * @returns
 *   the codes of the regions
 */
function knownRegions(): string[] {
	const names = new Intl.DisplayNames([ 'en' ], { type: 'region', fallback: 'none' });
	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	const result: string[] = [];
	for(const a of letters) {
		for(const b of letters) {
			const region = a + b;
			if(names.of(region)) result.push(region);
		}
	}

	return result;
}

interface LocaleWithWeekInfo {
	getWeekInfo?: () => { firstDay: number };
	weekInfo?: { firstDay: number };
}

/**
 * Read the day weeks start on from `Intl`.
 *
 * @param locale -
 *   the locale to read
 * @returns
 *   the day, or `undefined` if `Intl` has no week data
 */
function intlWeekStartsOn(locale: Intl.Locale): number | undefined {
	const withWeekInfo = locale as Intl.Locale & LocaleWithWeekInfo;
	return withWeekInfo.getWeekInfo
		? withWeekInfo.getWeekInfo().firstDay
		: withWeekInfo.weekInfo?.firstDay;
}

/**
 * Regions that are no longer in use, which `Intl` still has week data for,
 * and `ZZ` for an unknown region.
 */
const SKIPPED_REGIONS = new Set([ 'BU', 'RH', 'YD', 'ZZ' ]);

describe('Region week data', function() {
	it('Weeks start on Monday in Sweden', function() {
		expect(weekStartsOnInRegion(new Intl.Locale('sv'))).toEqual(DayOfWeek.MONDAY);
		expect(weekStartsOnInRegion(new Intl.Locale('sv-FI'))).toEqual(DayOfWeek.MONDAY);
	});

	it('Weeks start on Sunday in the United States', function() {
		expect(weekStartsOnInRegion(new Intl.Locale('en'))).toEqual(DayOfWeek.SUNDAY);
		expect(weekStartsOnInRegion(new Intl.Locale('en-US'))).toEqual(DayOfWeek.SUNDAY);
	});

	it('Weeks start on Monday in Great Britain', function() {
		expect(weekStartsOnInRegion(new Intl.Locale('en-GB'))).toEqual(DayOfWeek.MONDAY);
	});

	it('Weeks start on Saturday in Egypt', function() {
		expect(weekStartsOnInRegion(new Intl.Locale('ar-EG'))).toEqual(DayOfWeek.SATURDAY);
	});

	it('A locale without a region uses the region it is most likely written in', function() {
		expect(weekStartsOnInRegion(new Intl.Locale('ja'))).toEqual(DayOfWeek.SUNDAY);
	});

	/*
	 * Engines have different versions of CLDR, so the table is only checked
	 * against Node, where the version is known. A failure here after an
	 * update of Node means that CLDR changed and the table must be updated.
	 */
	const cldr = typeof process === 'undefined' ? undefined : process.versions?.cldr;

	it.runIf(cldr)('Every region has the same day as the week data of Intl', function() {
		for(const region of knownRegions()) {
			if(SKIPPED_REGIONS.has(region)) continue;

			const locale = new Intl.Locale('und-' + region);
			const expected = intlWeekStartsOn(locale);

			// Engines without week data can not check the table
			if(typeof expected === 'undefined') return;

			expect([ region, weekStartsOnInRegion(locale) ]).toEqual([ region, expected ]);
		}
	});
});
