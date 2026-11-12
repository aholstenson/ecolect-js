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
				day: 31
			});

			test('nästa fredag', now, {
				year: 2017,
				month: 1,
				day: 27
			});

			test('denna måndag', now, {
				year: 2017,
				month: 1,
				day: 30
			});

			test('förra måndagen', now, {
				year: 2017,
				month: 1,
				day: 23
			});
		});

		describe('Named days', function() {
			test('idag', now, {
				year: 2017,
				month: 1,
				day: 24
			});

			test('imorgon', now, {
				year: 2017,
				month: 1,
				day: 25
			});

			test('i övermorgon', now, {
				year: 2017,
				month: 1,
				day: 26
			});

			test('igår', now, {
				year: 2017,
				month: 1,
				day: 23
			});

			test('i förrgår', now, {
				year: 2017,
				month: 1,
				day: 22
			});
		});

		describe('Day and month', function() {
			// Swedish writes the day before the month
			test('12 januari', now, {
				year: 2017,
				month: 1,
				day: 12
			});

			test('den 12:e januari', now, {
				year: 2017,
				month: 1,
				day: 12
			});

			test('1 februari', now, {
				year: 2017,
				month: 2,
				day: 1
			});

			test('jan 12', now, {
				year: 2017,
				month: 1,
				day: 12
			});

			test('12 januari 2018', now, {
				year: 2018,
				month: 1,
				day: 12
			});

			test('32 januari', now, null);

			// A two digit year after a dash or an apostrophe
			test('5 jan -26', now, { year: 2026, month: 1, day: 5 });

			test('5 jan \'26', now, { year: 2026, month: 1, day: 5 });

			test('5 januari -99', now, { year: 1999, month: 1, day: 5 });
		});

		describe('Day of week before a day in a month', function() {
			test('torsdag 12 november', now, {
				year: 2017,
				month: 11,
				day: 12
			});

			test('torsdagen den 12 november', now, {
				year: 2017,
				month: 11,
				day: 12
			});
		});

		describe('Named month relative to now', function() {
			const november = { now: new Date(2026, 10, 8) };

			test('nästa mars', november, { year: 2027, month: 3, day: 1 });

			test('kommande mars', november, { year: 2027, month: 3, day: 1 });

			test('nästa november', november, { year: 2027, month: 11, day: 1 });

			test('nästa mars 5', november, { year: 2027, month: 3, day: 5 });

			test('5 nästa mars', november, { year: 2027, month: 3, day: 5 });

			test('förra mars', november, { year: 2026, month: 3, day: 1 });

			test('föregående mars', november, { year: 2026, month: 3, day: 1 });

			test('förra november', november, { year: 2025, month: 11, day: 1 });

			test('förra feb 29', november, { year: 2024, month: 2, day: 29 });

			test('denna mars', november, { year: 2026, month: 3, day: 1 });

			// A month written as a number is not a month after förra
			test('förra 2', november, null);
		});

		describe('Numeric dates', function() {
			test('2010-02-22', now, {
				year: 2010,
				month: 2,
				day: 22
			});

			test('2017-01-24', now, {
				year: 2017,
				month: 1,
				day: 24
			});
		});

		describe('Relative', function() {
			test('om 2 dagar', now, {
				year: 2017,
				month: 1,
				day: 26
			});

			test('2 dagar sedan', now, {
				year: 2017,
				month: 1,
				day: 22
			});

			test('för 2 dagar sedan', now, {
				year: 2017,
				month: 1,
				day: 22
			});

			test('för två år sedan', now, {
				year: 2015,
				month: 1,
				day: 24
			});

			test('om en vecka', now, {
				year: 2017,
				month: 1,
				day: 31
			});

			test('3 dagar efter imorgon', now, {
				year: 2017,
				month: 1,
				day: 28
			});
		});

		describe('Edges of a period', function() {
			test('slutet av månaden', now, {
				year: 2017,
				month: 1,
				day: 31
			});

			test('början av året', now, {
				year: 2017,
				month: 1,
				day: 1
			});

			test('sista dagen av februari', now, {
				year: 2017,
				month: 2,
				day: 28
			});

			test('början av nästa vecka', now, {
				year: 2017,
				month: 1,
				day: 30
			});
		});

		describe('Day of week in a period', function() {
			test('första fredagen 2020', now, {
				year: 2020,
				month: 1,
				day: 3
			});

			test('sista fredagen i januari', now, {
				year: 2017,
				month: 1,
				day: 27
			});
		});

		describe('Weeks', function() {
			test('vecka 2 2018', now, {
				year: 2018,
				month: 1,
				day: 8
			});
		});
	});
});
