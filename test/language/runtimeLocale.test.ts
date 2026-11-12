import { DayOfWeek } from 'datetime-types';

import { english } from '../../src/language/en/index.js';
import { resolveLocale } from '../../src/language/resolveLocale.js';
import { pickLocale, runtimeLocale, runtimeLocales } from '../../src/language/runtimeLocale.js';
import { dateIntervalValue } from '../../src/values/index.js';

describe('Runtime locale', function() {
	describe('Picking a locale', function() {
		it('The first locale is used without a language', function() {
			expect(pickLocale([ 'sv-SE', 'en-US' ])).toEqual('sv-SE');
		});

		it('The first locale in the language is used', function() {
			expect(pickLocale([ 'sv-SE', 'en-GB', 'en-US' ], 'en')).toEqual('en-GB');
		});

		it('A locale in the language keeps its extension', function() {
			expect(pickLocale([ 'en-US-u-fw-mon' ], 'en')).toEqual('en-US-u-fw-mon');
		});

		it('The region of the first locale is used when none is in the language', function() {
			expect(pickLocale([ 'sv-SE', 'de-DE' ], 'en')).toEqual('en-SE');
		});

		it('The extension of the first locale is used when none is in the language', function() {
			expect(pickLocale([ 'sv-SE-u-fw-sun' ], 'en')).toEqual('en-SE-u-fw-sun');
		});

		it('A locale without a region gives the language', function() {
			expect(pickLocale([ 'sv' ], 'en')).toEqual('en');
		});

		it('The POSIX form is read', function() {
			expect(pickLocale([ 'en_GB' ], 'en')).toEqual('en-GB');
		});

		it('A tag that is not valid is skipped', function() {
			expect(pickLocale([ 'not a locale', 'en-GB' ], 'en')).toEqual('en-GB');
		});

		it('An empty list gives no locale', function() {
			expect(pickLocale([], 'en')).toBeUndefined();
		});
	});

	describe('Reading the runtime', function() {
		it('The runtime reports at least one locale', function() {
			expect(runtimeLocales().length).toBeGreaterThan(0);
		});

		it('The locale for a language is in that language', function() {
			expect(new Intl.Locale(runtimeLocale('en')).language).toEqual('en');
			expect(new Intl.Locale(runtimeLocale('sv')).language).toEqual('sv');
		});

		it('The locale without a language is a valid locale', function() {
			expect(() => resolveLocale(runtimeLocale())).not.toThrow();
		});
	});

	describe('Week start', function() {
		// A Thursday
		const now = new Date(2026, 10, 12);

		it('English in Sweden starts weeks on Monday', async function() {
			const locale = pickLocale([ 'sv-SE' ], 'en') as string;
			expect(resolveLocale(locale).weekStartsOn).toEqual(DayOfWeek.MONDAY);

			const match = await dateIntervalValue().matcher(english(locale)).match('next week', { now });
			expect(match?.start?.toString()).toEqual('2026-11-16');
		});

		it('A first day of the week in the locale wins over the region', async function() {
			expect(resolveLocale('en-US-u-fw-mon').weekStartsOn).toEqual(DayOfWeek.MONDAY);
			expect(resolveLocale('en-SE-u-fw-sun').weekStartsOn).toEqual(DayOfWeek.SUNDAY);

			const match = await dateIntervalValue().matcher(english('en-US-u-fw-mon')).match('next week', { now });
			expect(match?.start?.toString()).toEqual('2026-11-16');
		});

		it('English in the United States starts weeks on Sunday', async function() {
			const match = await dateIntervalValue().matcher(english('en-US')).match('next week', { now });
			expect(match?.start?.toString()).toEqual('2026-11-15');
		});
	});
});
