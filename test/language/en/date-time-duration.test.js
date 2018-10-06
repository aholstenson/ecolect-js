'use strict';

const en = require('../../../language/en');
const test = require('../helpers').testRunner(en.dateTimeDuration);

describe('English', function() {

	describe('Date & Time Duration', function() {

		test('1 hour', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 0,
			hours: 1,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('4 days', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 4,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('4 days and 10 minutes', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 4,
			hours: 0,
			minutes: 10,
			seconds: 0,
			milliseconds: 0
		});

		test('4 days 10 minutes', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 4,
			hours: 0,
			minutes: 10,
			seconds: 0,
			milliseconds: 0
		});

	});

});
