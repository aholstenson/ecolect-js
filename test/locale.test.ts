import { DayOfWeek } from 'datetime-types';

import { intentsBuilder } from '../src/index.js';
import { en, english } from '../src/language/en/index.js';
import type { Language } from '../src/language/index.js';
import { localeMatchOptions } from '../src/matching/index.js';
import { newPhrases } from '../src/resolver/newPhrases.js';
import { DateOrder, MonthDayOrder, WeekParts } from '../src/type-datetime/index.js';
import { dateValue } from '../src/values/date.js';
import { dateIntervalValue, dateTimeValue } from '../src/values/index.js';

const now = new Date(2017, 0, 24);

const enGB = english('en-GB');

describe('Locale', function() {
	describe('Language locale', function() {
		it('en reads a numeric date as month, day and year', async function() {
			const match = await dateValue().matcher(en).match('1/2/2017', { now: now });
			expect(match).toEqual({ year: 2017, month: 1, day: 2 });
		});

		it('en-GB reads a numeric date as day, month and year', async function() {
			const match = await dateValue().matcher(enGB).match('1/2/2017', { now: now });
			expect(match).toEqual({ year: 2017, month: 2, day: 1 });
		});

		it('en starts weeks on Sunday', async function() {
			const match = await dateValue().matcher(en).match('start of week', { now: now });
			expect(match).toEqual({ year: 2017, month: 1, day: 22 });
		});

		it('en-GB starts weeks on Monday', async function() {
			const match = await dateValue().matcher(enGB).match('start of week', { now: now });
			expect(match).toEqual({ year: 2017, month: 1, day: 23 });
		});

		it('the locale of a language is left unchanged', function() {
			expect(en.locale).toEqual('en-US');
			expect(enGB.locale).toEqual('en-GB');
		});

		it('a language reading the same locale is not derived again', function() {
			expect(en.withLocale('en-US')).toBe(en);
		});

		it('a derived language shares the graphs it was derived from', function() {
			expect(enGB.findGraph('date' as any)).toBe(en.findGraph('date' as any));
		});

		it('changing the options read from a locale does not change later matches', async function() {
			const options = localeMatchOptions('en-AU');
			const original = options.dateOrder;

			try {
				try {
					options.dateOrder = DateOrder.YearMonthDay;
				} catch {
					// Options that can not be changed are fine
				}

				const match = await dateValue().matcher(en)
					.match('1/2/2017', { now: now, locale: 'en-AU' });

				expect(match).toEqual({ year: 2017, month: 2, day: 1 });
			} finally {
				if(! Object.isFrozen(options)) {
					options.dateOrder = original;
				}
			}
		});
	});

	describe('Settings of the user in the options of a language', function() {
		// A Thursday at 10:00
		const thursday = new Date(2026, 10, 12, 10, 0);

		it('weekStartsOn wins over the locale of the language', async function() {
			const language = english('en-US', { weekStartsOn: DayOfWeek.MONDAY });
			const match = await dateIntervalValue().matcher(language).match('next week', { now: thursday });

			expect(match?.start?.toString()).toEqual('2026-11-16');
			expect(match?.end?.toString()).toEqual('2026-11-22');
		});

		it('weekStartsOn wins over the locale of a match', async function() {
			const language = english('en-GB', { weekStartsOn: DayOfWeek.SUNDAY });
			const match = await dateIntervalValue().matcher(language)
				.match('next week', { now: thursday, locale: 'sv-SE' });

			expect(match?.start?.toString()).toEqual('2026-11-15');
		});

		it('weekStartsOn of a match wins over the one of the language', async function() {
			const language = english('en-US', { weekStartsOn: DayOfWeek.MONDAY });
			const match = await dateIntervalValue().matcher(language)
				.match('next week', { now: thursday, weekStartsOn: DayOfWeek.SUNDAY });

			expect(match?.start?.toString()).toEqual('2026-11-15');
		});

		it('firstWeekContainsDate decides the number of a week', async function() {
			const language = english('en-US', { weekStartsOn: DayOfWeek.MONDAY, firstWeekContainsDate: 4 });
			const match = await dateIntervalValue().matcher(language).match('week 1 2027', { now: thursday });

			// January 1st 2027 is a Friday, so the ISO week 1 starts on January 4th
			expect(match?.start?.toString()).toEqual('2027-01-04');
		});

		it('dateOrder wins over the locale', async function() {
			const language = english('en-US', { dateOrder: DateOrder.DayMonthYear });
			const match = await dateValue().matcher(language).match('1/2/2017', { now: thursday });

			expect(match).toEqual({ year: 2017, month: 2, day: 1 });
		});

		it('dayParts sets the hours of the parts of the day', async function() {
			const language = english('en-US', { dayParts: { endOfDay: 18 } });
			const match = await dateTimeValue().matcher(language).match('end of day', { now: thursday });

			expect(match?.toString()).toEqual('2026-11-12T18:00:00');
		});

		it('weekParts sets the days of the parts of a week', async function() {
			const language = english('en-US', { weekParts: WeekParts.FullWeek });
			const match = await dateIntervalValue().matcher(language).match('late next week', { now: thursday });

			expect(match?.start?.toString()).toEqual('2026-11-20');
		});

		it('A language with settings keeps them with a vocabulary', async function() {
			const language = english('en-US', { weekStartsOn: DayOfWeek.MONDAY }).withVocabulary({});
			const match = await dateIntervalValue().matcher(language).match('next week', { now: thursday });

			expect(match?.start?.toString()).toEqual('2026-11-16');
		});

		it('A value within a phrase uses the settings', async function() {
			const matcher = intentsBuilder(english('en-US', { weekStartsOn: DayOfWeek.MONDAY }))
				.add('show', newPhrases().value('when', dateIntervalValue()).phrase('show {when}').build())
				.build();

			const match = await matcher.match('show next week', { now: thursday });
			expect(match?.values.when?.start?.toString()).toEqual('2026-11-16');
		});

		it('A weekStartsOn that is not a day is an error when the language is made', function() {
			expect(() => english('en-US', { weekStartsOn: 9 as DayOfWeek })).toThrow('weekStartsOn');
		});

		it('A weekStartsOn of a match that is not a day rejects the match', async function() {
			await expect(dateIntervalValue().matcher(en).match('next week', { now: thursday, weekStartsOn: 9 as DayOfWeek }))
				.rejects.toThrow('weekStartsOn');
		});
	});

	describe('Locale in the options of a match', function() {
		it('the locale of the match wins over the one of the language', async function() {
			const match = await dateValue().matcher(en)
				.match('1/2/2017', { now: now, locale: 'en-GB' });

			expect(match).toEqual({ year: 2017, month: 2, day: 1 });
		});

		it('an option set directly wins over the locale', async function() {
			const match = await dateValue().matcher(enGB)
				.match('1/2/2017', { now: now, dateOrder: DateOrder.MonthDayYear });

			expect(match).toEqual({ year: 2017, month: 1, day: 2 });
		});

		it('a date order set directly also decides the order of the month and the day', async function() {
			const match = await dateValue().matcher(en)
				.match('1/2', { now: now, locale: 'sv-SE', dateOrder: DateOrder.YearMonthDay });

			expect(match).toEqual({ year: 2017, month: 1, day: 2 });
		});

		it('an order of the month and the day set directly wins over the locale', async function() {
			const match = await dateValue().matcher(en)
				.match('1/2', { now: now, monthDayOrder: MonthDayOrder.DayMonth });

			expect(match).toEqual({ year: 2017, month: 2, day: 1 });
		});

		it('an invalid locale rejects the match of a value', function() {
			let result: Promise<unknown> | undefined;
			expect(() => {
				result = dateValue().matcher(en).match('1/2/2017', { now: now, locale: 'not a locale' });
			}).not.toThrow();

			return expect(result).rejects.toThrow(/not a locale/);
		});

		it('an invalid locale rejects the match of an intent', function() {
			const intents = intentsBuilder(en)
				.add('x', newPhrases().phrase('x').build())
				.build();

			let result: Promise<unknown> | undefined;
			expect(() => {
				result = intents.match('x', { locale: 'not a locale' });
			}).not.toThrow();

			return expect(result).rejects.toThrow(/not a valid locale/);
		});

		it('an empty locale rejects matching everything', function() {
			const intents = intentsBuilder(en)
				.add('x', newPhrases().phrase('x').build())
				.build();

			let result: Promise<unknown> | undefined;
			expect(() => {
				result = intents.matchAll('x', { locale: '' });
			}).not.toThrow();

			return expect(result).rejects.toThrow(/not a valid locale/);
		});
	});

	describe('Values within phrases', function() {
		const phrases = (language: Language = en) => newPhrases()
			.value('when', dateValue())
			.phrase('due {when}')
			.toMatcher(language);

		it('en reads a numeric date as month, day and year', async function() {
			const match = await phrases().match('due 1/2/2017', { now: now });
			expect(match?.values.when).toEqual({ year: 2017, month: 1, day: 2 });
		});

		it('en-GB reads a numeric date as day, month and year', async function() {
			const match = await phrases(enGB).match('due 1/2/2017', { now: now });
			expect(match?.values.when).toEqual({ year: 2017, month: 2, day: 1 });
		});

		it('the locale of the match wins over the one of the language', async function() {
			const match = await phrases().match('due 1/2/2017', { now: now, locale: 'en-GB' });
			expect(match?.values.when).toEqual({ year: 2017, month: 2, day: 1 });
		});

		it('a locale written with an underscore is read, or the error tells how to write it', async function() {
			let match;
			try {
				match = await phrases().match('due 1/2/2017', { now: now, locale: 'en_GB' });
			} catch(err) {
				expect((err as Error).message).toMatch(/BCP 47/);
				return;
			}

			expect(match?.values.when).toEqual({ year: 2017, month: 2, day: 1 });
		});
	});
});
