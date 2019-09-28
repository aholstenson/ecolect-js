import { en } from '../../../src/language/en';
import { testRunner } from '../helpers';

const test = testRunner(en, 'time-duration');

describe('English', function() {

	describe('Time Duration', function() {

		test('1 hour', {}, {
			hours: 1
		});

		test('2 hrs', {}, {
			hours: 2
		});

		test('5h', {}, {
			hours: 5
		});

		test('10 minutes', {}, {
			minutes: 10
		});

		test('75 m', {}, {
			minutes: 75
		});

		test('10 seconds', {}, {
			seconds: 10,
		});

		test('20 s', {}, {
			seconds: 20
		});

		test('200 ms', {}, {
			milliseconds: 200
		});

		test('1 ms', {}, {
			milliseconds: 1
		});

		test('5001 millis', {}, {
			milliseconds: 5001
		});

		test('1 h, 4 sec', {}, {
			hours: 1,
			seconds: 4
		});

		test('1 hour and 4 minutes', {}, {
			hours: 1,
			minutes: 4
		});

	});

});
