import en from '../../../src/language/en';
import { testRunner } from '../helpers';

const test = testRunner(en.dateDuration);

describe('English', function() {
	describe('Date Duration', function() {

		test('3 days', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 3,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('1 d', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 1,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('2 months and 3 days', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 2,
			days: 3,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('1 week', {}, {
			years: 0,
			quarters: 0,
			weeks: 1,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('two weeks', {}, {
			years: 0,
			quarters: 0,
			weeks: 2,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('2w', {}, {
			years: 0,
			quarters: 0,
			weeks: 2,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('2wks', {}, {
			years: 0,
			quarters: 0,
			weeks: 2,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('2 months', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 2,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('1 year', {}, {
			years: 1,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('1 year and 2 months', {}, {
			years: 1,
			quarters: 0,
			weeks: 0,
			months: 2,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('1 year, 2 weeks', {}, {
			years: 1,
			quarters: 0,
			weeks: 2,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('1 quarter', {}, {
			years: 0,
			quarters: 1,
			weeks: 0,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});
	});

});
