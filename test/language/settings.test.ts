import { DayOfWeek } from 'datetime-types';

import { en, english } from '../../src/language/en/index.js';
import { withRegion } from '../../src/language/LanguageSettings.js';
import { isWebKit, regionOfTimeZone } from '../../src/language/runtimeLocale.js';
import { swedish } from '../../src/language/sv/index.js';
import { DateOrder, MonthDayOrder, WeekParts } from '../../src/type-datetime/index.js';
import { dateIntervalValue, dateTimeValue, dateValue } from '../../src/values/index.js';

// A Thursday at 10:00
const now = new Date(2026, 10, 12, 10, 0);

/**
 * Match an interval and describe it as `start..end`.
 *
 * @param language -
 *   the language to match with
 * @param text -
 *   the expression
 * @param options -
 *   options of the match
 * @returns
 *   the interval, or `null` if nothing matched
 */
async function interval(language: any, text: string, options: object = {}): Promise<string | null> {
	const match = await dateIntervalValue().matcher(language).match(text, { now, ...options });
	return match ? match.start?.toString() + '..' + match.end?.toString() : null;
}

describe('Language settings', function() {
	describe('Making a language', function() {
		it('English without settings is en-US', function() {
			expect(en.locale).toEqual('en-US');
			expect(en.settings.sources.locale).toEqual('default');
		});

		it('A locale as text is used', function() {
			expect(english('en-GB').locale).toEqual('en-GB');
			expect(english('en-GB').settings.sources.locale).toEqual('option');
		});

		it('The POSIX form of a locale is read', function() {
			expect(english('en_GB').locale).toEqual('en-GB');
		});

		it('Settings as plain data name the locale', function() {
			expect(english({ locale: 'en-GB' }).locale).toEqual('en-GB');
		});

		it('Settings without a locale keep the locale of the language', function() {
			expect(english({ weekStartsOn: 'monday' }).locale).toEqual('en-US');
			expect(swedish({ weekStartsOn: 'sunday' }).locale).toEqual('sv-SE');
		});

		it('A locale that is not valid is an error', function() {
			expect(() => english('en GB')).toThrow('not a valid locale');
			expect(() => english({ locale: 'en GB' })).toThrow('not a valid locale');
		});

		it('Settings survive JSON', async function() {
			const stored = JSON.stringify({ locale: 'en-US', region: 'SE', weekStartsOn: 'monday', dayParts: { lunch: '11:30' } });
			const language = english(JSON.parse(stored));

			expect(language.locale).toEqual('en-SE');
			expect(await interval(language, 'next week')).toEqual('2026-11-16..2026-11-22');
		});
	});

	describe('Region', function() {
		it('A region replaces the region of the locale', function() {
			expect(english({ region: 'SE' }).locale).toEqual('en-SE');
			expect(english('en-GB', { region: 'se' }).locale).toEqual('en-SE');
			expect(english({ locale: 'en-US', region: 'SE' }).settings.region).toEqual('SE');
		});

		it('A region keeps the extension of the locale', function() {
			expect(withRegion('en-US-u-fw-sun', 'SE')).toEqual('en-SE-u-fw-sun');
		});

		it('A region changes the conventions', async function() {
			const language = english({ region: 'SE' });

			expect(language.settings.weekStartsOn).toEqual('monday');
			expect(language.settings.weekNumbering).toEqual('iso');
			expect(await interval(language, 'next week')).toEqual('2026-11-16..2026-11-22');
		});

		it('The source of the region is known', function() {
			expect(english({ region: 'SE' }).settings.sources.region).toEqual('option');
			expect(english('en-GB').settings.sources.region).toEqual('locale');
		});

		it('A region that is not valid is an error', function() {
			expect(() => english({ region: 'Sweden' })).toThrow('not a valid region');
		});
	});

	describe('Region from the time zone', function() {
		it('A time zone in one region gives that region', function() {
			expect(regionOfTimeZone('Europe/Stockholm')).toEqual('SE');
			expect(regionOfTimeZone('America/New_York')).toEqual('US');
			expect(regionOfTimeZone('Australia/Sydney')).toEqual('AU');
			expect(regionOfTimeZone('Europe/London')).toEqual('GB');
		});

		it('A time zone that is not known gives no region', function() {
			expect(regionOfTimeZone('Nowhere/Special')).toBeUndefined();
		});

		it('The locale of the runtime uses the region of the time zone when asked', function() {
			const language = english({ locale: 'auto', regionFromTimeZone: true });
			const region = regionOfTimeZone();

			expect(language.settings.sources.locale).toEqual('runtime');
			if(region) {
				expect(language.settings.region).toEqual(region);
				expect(language.settings.sources.region).toEqual('timeZone');
			}
		});

		it('The time zone is not used when turned off', function() {
			const language = english({ locale: 'auto', regionFromTimeZone: false });
			expect(language.settings.sources.region).not.toEqual('timeZone');
		});

		it('The time zone is used on its own in WebKit only', function() {
			const language = english('auto');
			const guessed = language.settings.sources.region === 'timeZone';

			expect(guessed).toEqual(isWebKit() && typeof regionOfTimeZone() !== 'undefined');
		});

		it('A region wins over the time zone', function() {
			const language = english({ locale: 'auto', regionFromTimeZone: true, region: 'JP' });

			expect(language.settings.region).toEqual('JP');
			expect(language.settings.sources.region).toEqual('option');
		});

		it('The time zone is not used with a locale that is set', function() {
			const language = english({ locale: 'en-US', regionFromTimeZone: true });
			expect(language.locale).toEqual('en-US');
		});

		it('The locale of the runtime is in the language', function() {
			expect(new Intl.Locale(english('auto').locale).language).toEqual('en');
			expect(new Intl.Locale(swedish('auto').locale).language).toEqual('sv');
		});
	});

	describe('Days as names', function() {
		it('weekStartsOn can be a name', async function() {
			expect(await interval(english({ weekStartsOn: 'monday' }), 'next week')).toEqual('2026-11-16..2026-11-22');
			expect(await interval(english({ weekStartsOn: 'Mon' as any }), 'next week')).toEqual('2026-11-16..2026-11-22');
			expect(await interval(english('en-SE', { weekStartsOn: 'sunday' }), 'next week')).toEqual('2026-11-15..2026-11-21');
		});

		it('weekStartsOn can be a name in the options of a match', async function() {
			expect(await interval(en, 'next week', { weekStartsOn: 'monday' })).toEqual('2026-11-16..2026-11-22');
		});

		it('weekStartsOn can be a number', async function() {
			expect(await interval(english({ weekStartsOn: DayOfWeek.MONDAY }), 'next week')).toEqual('2026-11-16..2026-11-22');
		});

		it('A name that is not a day is an error', function() {
			expect(() => english({ weekStartsOn: 'someday' as any })).toThrow('weekStartsOn');
		});
	});

	describe('Week numbering', function() {
		it('iso is the first week with four days in it', async function() {
			const language = english({ weekStartsOn: 'monday', weekNumbering: 'iso' });

			expect(language.settings.firstWeekContainsDate).toEqual(4);
			expect(await interval(language, 'week 1 2027')).toEqual('2027-01-04..2027-01-10');
		});

		it('first-day is the week with January 1st in it', async function() {
			const language = english('en-SE', { weekNumbering: 'first-day' });

			expect(language.settings.firstWeekContainsDate).toEqual(1);
			expect(await interval(language, 'week 1 2027')).toEqual('2026-12-28..2027-01-03');
		});

		it('firstWeekContainsDate wins over the name', function() {
			expect(english({ weekNumbering: 'iso', firstWeekContainsDate: 1 }).settings.firstWeekContainsDate).toEqual(1);
		});

		it('A numbering that is not known is an error', function() {
			expect(() => english({ weekNumbering: 'lunar' as any })).toThrow('weekNumbering');
		});
	});

	describe('Weekend', function() {
		it('The weekend is Saturday and Sunday in most regions', async function() {
			expect(en.settings.weekend).toEqual([ 'saturday', 'sunday' ]);
			expect(await interval(en, 'this weekend')).toEqual('2026-11-14..2026-11-15');
		});

		it('The weekend comes from the region', async function() {
			const language = english({ region: 'SA' });

			expect(language.settings.weekend).toEqual([ 'friday', 'saturday' ]);
			expect(language.settings.sources.weekend).toEqual('locale');
			expect(await interval(language, 'this weekend')).toEqual('2026-11-13..2026-11-14');
		});

		it('The weekend can be set', async function() {
			const language = english({ weekend: [ 'friday', 'saturday' ] });

			expect(language.settings.sources.weekend).toEqual('option');
			expect(await interval(language, 'this weekend')).toEqual('2026-11-13..2026-11-14');
			expect(await interval(language, 'last weekend')).toEqual('2026-11-06..2026-11-07');
		});

		it('The weekend can be set in the options of a match', async function() {
			expect(await interval(en, 'this weekend', { weekend: [ 'friday', 'saturday' ] })).toEqual('2026-11-13..2026-11-14');
		});

		it('A weekend of one day is that day', async function() {
			expect(await interval(english({ weekend: [ 'sunday' ] }), 'this weekend')).toEqual('2026-11-15..2026-11-15');
		});

		it('The next weekend is not the current one on a day of the weekend', async function() {
			const language = english({ weekend: [ 'friday', 'saturday' ] });
			const friday = { now: new Date(2026, 10, 13) };

			expect(await interval(language, 'this weekend', friday)).toEqual('2026-11-13..2026-11-14');
			expect(await interval(language, 'next weekend', friday)).toEqual('2026-11-20..2026-11-21');
		});

		it('The work days are the days outside of the weekend', async function() {
			// Weeks start on Sunday and the work days are Sunday to Thursday
			const language = english({ weekStartsOn: 'sunday', weekend: [ 'friday', 'saturday' ] });

			expect(await interval(language, 'early next week')).toEqual('2026-11-15..2026-11-16');
			expect(await interval(language, 'mid next week')).toEqual('2026-11-17..2026-11-17');
			expect(await interval(language, 'late next week')).toEqual('2026-11-18..2026-11-19');
		});

		it('A week with six work days has a middle part of two days', async function() {
			const language = english({ weekStartsOn: 'monday', weekend: [ 'sunday' ] });

			expect(await interval(language, 'early next week')).toEqual('2026-11-16..2026-11-17');
			expect(await interval(language, 'mid next week')).toEqual('2026-11-18..2026-11-19');
			expect(await interval(language, 'late next week')).toEqual('2026-11-20..2026-11-21');
		});

		it('A weekend that is not a list of days is an error', function() {
			expect(() => english({ weekend: [ 'caturday' ] as any })).toThrow('weekend');
			expect(() => english({ weekend: [] })).toThrow('weekend');
		});
	});

	describe('Parts of the day', function() {
		it('A part can be a time with minutes', async function() {
			const language = english({ dayParts: { lunch: '11:30' } });

			expect((await dateTimeValue().matcher(language).match('lunch', { now }))?.toString()).toEqual('2026-11-12T11:30:00');
			expect((await dateTimeValue().matcher(language).match('after lunch', { now }))?.toString()).toEqual('2026-11-12T12:30:00');
		});

		it('A match only replaces the parts it names', async function() {
			const matcher = dateTimeValue().matcher(english({ dayParts: { lunch: 11, endOfDay: 18 } }));
			const options = { now, dayParts: { lunch: 13 } };

			expect((await matcher.match('lunch', options))?.toString()).toEqual('2026-11-12T13:00:00');
			expect((await matcher.match('end of day', options))?.toString()).toEqual('2026-11-12T18:00:00');
		});

		it('A part that is not a time is an error', function() {
			expect(() => english({ dayParts: { lunch: 'noonish' } })).toThrow('dayParts.lunch');
			expect(() => english({ dayParts: { lunch: 24 } })).toThrow('dayParts.lunch');
			expect(() => english({ dayParts: { brunch: 11 } as any })).toThrow('brunch');
		});
	});

	describe('Resolved settings', function() {
		it('Every setting has a value', function() {
			expect(en.settings).toEqual({
				language: 'en',
				locale: 'en-US',
				region: 'US',
				weekStartsOn: 'sunday',
				weekNumbering: 'first-day',
				firstWeekContainsDate: 1,
				weekend: [ 'saturday', 'sunday' ],
				dateOrder: DateOrder.MonthDayYear,
				monthDayOrder: MonthDayOrder.MonthDay,
				decimalSeparator: '.',
				groupSeparator: ',',
				numberSeparators: 'auto',
				ambiguousSeparator: 'group',
				dayParts: { morning: 9, lunch: 12, afternoon: 15, evening: 19, night: 22, startOfDay: 9, endOfDay: 17 },
				weekParts: WeekParts.WorkWeek,
				sources: {
					locale: 'default',
					region: 'locale',
					weekStartsOn: 'locale',
					firstWeekContainsDate: 'locale',
					weekNumbering: 'locale',
					weekend: 'locale',
					dateOrder: 'locale',
					monthDayOrder: 'locale',
					weekParts: 'default',
					dayParts: 'default',
					numberSeparators: 'default',
					ambiguousSeparator: 'default',
					decimalSeparator: 'locale',
					groupSeparator: 'locale'
				}
			});
		});

		it('The source of a setting that was given is option', function() {
			const settings = english({ region: 'SE', weekStartsOn: 'sunday', dayParts: { lunch: 11 } }).settings;

			expect(settings.weekStartsOn).toEqual('sunday');
			expect(settings.sources.weekStartsOn).toEqual('option');
			expect(settings.sources.firstWeekContainsDate).toEqual('locale');
			expect(settings.dayParts.lunch).toEqual(11);
			expect(settings.dayParts.morning).toEqual(9);
			expect(settings.sources.dayParts).toEqual('option');
		});

		it('A date order that was given also decides the order of the month and the day', async function() {
			const language = english({ dateOrder: DateOrder.DayMonthYear });

			expect(language.settings.monthDayOrder).toEqual(MonthDayOrder.DayMonth);
			expect(await dateValue().matcher(language).match('1/2', { now })).toEqual({ year: 2027, month: 2, day: 1 });
		});

		it('The settings are plain data that can not be changed', function() {
			const settings = english({ region: 'SE' }).settings;

			expect(JSON.parse(JSON.stringify(settings))).toEqual(settings);
			expect(Object.isFrozen(settings)).toBe(true);
			expect(Object.isFrozen(settings.sources)).toBe(true);
		});

		it('The settings give the same language back', function() {
			const language = english({ locale: 'en-GB', region: 'SE', weekStartsOn: 'sunday', weekNumbering: 'first-day', dayParts: { lunch: '11:30' } });
			const stored = JSON.parse(JSON.stringify(language.settings));

			expect(english(stored).settings).toEqual(language.settings);
		});

		it('Only the settings that were given are kept when the settings are given back', function() {
			const stored = JSON.parse(JSON.stringify(english({ locale: 'en-SE' }).settings));

			// The week start came from the locale, so another region decides it again
			const moved = english({ ...stored, region: 'US', sources: { ...stored.sources, region: 'option' } });
			expect(moved.locale).toEqual('en-US');
			expect(moved.settings.weekStartsOn).toEqual('sunday');
		});

		it('A locale from the runtime is read again when the settings are given back', function() {
			const stored = JSON.parse(JSON.stringify(english('auto').settings));
			expect(english(stored).settings.sources.locale).toEqual('runtime');
		});

		it('A language with a vocabulary keeps its settings', function() {
			const language = english({ region: 'SE', weekStartsOn: 'sunday' });
			expect(language.withVocabulary({}).settings).toEqual(language.settings);
		});
	});
});
