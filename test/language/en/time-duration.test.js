'use strict';

const en = require('../../../language/en');
const test = require('../helpers').testRunner(en.timeDuration);

describe('English', function() {

	describe('Time Duration', function() {

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

		test('2 hrs', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 0,
			hours: 2,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('5h', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 0,
			hours: 5,
			minutes: 0,
			seconds: 0,
			milliseconds: 0
		});

		test('10 minutes', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 10,
			seconds: 0,
			milliseconds: 0
		});

		test('75 m', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 75,
			seconds: 0,
			milliseconds: 0
		});

		test('10 seconds', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 10,
			milliseconds: 0
		});

		test('20 s', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 20,
			milliseconds: 0
		});

		test('200 ms', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 200
		});

		test('1 ms', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 1
		});

		test('5001 millis', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 5001
		});

		test('1 h, 4 sec', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 0,
			hours: 1,
			minutes: 0,
			seconds: 4,
			milliseconds: 0
		});

		test('1 hour and 4 minutes', {}, {
			years: 0,
			quarters: 0,
			weeks: 0,
			months: 0,
			days: 0,
			hours: 1,
			minutes: 4,
			seconds: 0,
			milliseconds: 0
		});

	});

});
