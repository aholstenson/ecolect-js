import { Language } from '@ecolect/language';
import { en, english } from '@ecolect/language-en';
import { DateOrder } from '@ecolect/type-datetime';

import { newPhrases } from '../src/resolver/newPhrases.js';
import { dateValue } from '../src/values/date.js';

const now = new Date(2017, 0, 24);

const enGB = english('en-GB');

describe('Locale', function() {
	describe('Language locale', function() {
		it('en reads a numeric date as month, day and year', async function() {
			const match = await dateValue().matcher(en).match('1/2/2017', { now: now });
			expect(match).toEqual({ year: 2017, month: 1, dayOfMonth: 2 });
		});

		it('en-GB reads a numeric date as day, month and year', async function() {
			const match = await dateValue().matcher(enGB).match('1/2/2017', { now: now });
			expect(match).toEqual({ year: 2017, month: 2, dayOfMonth: 1 });
		});

		it('en starts weeks on Sunday', async function() {
			const match = await dateValue().matcher(en).match('start of week', { now: now });
			expect(match).toEqual({ year: 2017, month: 1, dayOfMonth: 22 });
		});

		it('en-GB starts weeks on Monday', async function() {
			const match = await dateValue().matcher(enGB).match('start of week', { now: now });
			expect(match).toEqual({ year: 2017, month: 1, dayOfMonth: 23 });
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
	});

	describe('Locale in the options of a match', function() {
		it('the locale of the match wins over the one of the language', async function() {
			const match = await dateValue().matcher(en)
				.match('1/2/2017', { now: now, locale: 'en-GB' });

			expect(match).toEqual({ year: 2017, month: 2, dayOfMonth: 1 });
		});

		it('an option set directly wins over the locale', async function() {
			const match = await dateValue().matcher(enGB)
				.match('1/2/2017', { now: now, dateOrder: DateOrder.MonthDayYear });

			expect(match).toEqual({ year: 2017, month: 1, dayOfMonth: 2 });
		});
	});

	describe('Values within phrases', function() {
		const phrases = (language: Language = en) => newPhrases()
			.value('when', dateValue())
			.phrase('due {when}')
			.toMatcher(language);

		it('en reads a numeric date as month, day and year', async function() {
			const match = await phrases().match('due 1/2/2017', { now: now });
			expect(match?.values.when).toEqual({ year: 2017, month: 1, dayOfMonth: 2 });
		});

		it('en-GB reads a numeric date as day, month and year', async function() {
			const match = await phrases(enGB).match('due 1/2/2017', { now: now });
			expect(match?.values.when).toEqual({ year: 2017, month: 2, dayOfMonth: 1 });
		});

		it('the locale of the match wins over the one of the language', async function() {
			const match = await phrases().match('due 1/2/2017', { now: now, locale: 'en-GB' });
			expect(match?.values.when).toEqual({ year: 2017, month: 2, dayOfMonth: 1 });
		});
	});
});
