import { en } from '../../../src/language/en';
import { testRunner } from '../helpers';

const test = testRunner(en, 'date-time-duration');

describe('English', function() {

	describe('Date & Time Duration', function() {

		test('1 hour', {}, {
			hours: 1
		});

		test('4 days', {}, {
			days: 4
		});

		test('4 days and 10 minutes', {}, {
			days: 4,
			minutes: 10
		});

		test('4 days 10 minutes', {}, {
			days: 4,
			minutes: 10
		});

	});

});
