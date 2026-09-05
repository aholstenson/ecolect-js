import { dateGraph } from '../../../src/language/sv/dateGraph.js';
import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { mapDate } from '../../../src/type-datetime/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), dateGraph, mapDate);

// Sweden starts weeks on Monday and writes the year first in a numeric date
const now = { now: new Date(2017, 0, 24), weekStartsOn: 1, firstWeekContainsDate: 4 };

describe('Swedish', function() {
	describe('Date', function() {
		describe('Weekdays', function() {
			test('på tisdag', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 31
			});

			test('nästa fredag', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 27
			});

			test('denna måndag', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 30
			});

			test('förra måndagen', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 23
			});
		});

		describe('Named days', function() {
			test('idag', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 24
			});

			test('imorgon', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 25
			});

			test('i övermorgon', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 26
			});

			test('igår', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 23
			});

			test('i förrgår', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 22
			});
		});

		describe('Day and month', function() {
			// Swedish writes the day before the month
			test('12 januari', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 12
			});

			test('den 12:e januari', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 12
			});

			test('1 februari', now, {
				year: 2017,
				month: 2,
				dayOfMonth: 1
			});

			test('jan 12', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 12
			});

			test('12 januari 2018', now, {
				year: 2018,
				month: 1,
				dayOfMonth: 12
			});

			test('32 januari', now, null);
		});

		describe('Numeric dates', function() {
			test('2010-02-22', now, {
				year: 2010,
				month: 2,
				dayOfMonth: 22
			});

			test('2017-01-24', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 24
			});
		});

		describe('Relative', function() {
			test('om 2 dagar', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 26
			});

			test('2 dagar sedan', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 22
			});

			test('om en vecka', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 31
			});

			test('3 dagar efter imorgon', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 28
			});
		});

		describe('Edges of a period', function() {
			test('slutet av månaden', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 31
			});

			test('början av året', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 1
			});

			test('sista dagen av februari', now, {
				year: 2017,
				month: 2,
				dayOfMonth: 28
			});

			test('början av nästa vecka', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 30
			});
		});

		describe('Day of week in a period', function() {
			test('första fredagen 2020', now, {
				year: 2020,
				month: 1,
				dayOfMonth: 3
			});

			test('sista fredagen i januari', now, {
				year: 2017,
				month: 1,
				dayOfMonth: 27
			});
		});

		describe('Weeks', function() {
			test('vecka 2 2018', now, {
				year: 2018,
				month: 1,
				dayOfMonth: 8
			});
		});
	});
});
