import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { timeGraph } from '../../../src/language/sv/timeGraph.js';
import { mapTime } from '../../../src/type-datetime/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), timeGraph, mapTime);

const morning = { now: new Date(2010, 0, 1, 10, 0) };

describe('Swedish', function() {
	describe('Time', function() {
		test('00:00', morning, {
			hour: 0,
			minute: 0,
			second: 0,
			milliOfSecond: 0
		});

		// Swedish writes the clock with a period as often as with a colon
		test('14.30', morning, {
			hour: 14,
			minute: 30,
			second: 0,
			milliOfSecond: 0
		});

		test('kl 15', morning, {
			hour: 15,
			minute: 0,
			second: 0,
			milliOfSecond: 0
		});

		test('klockan 15:30', morning, {
			hour: 15,
			minute: 30,
			second: 0,
			milliOfSecond: 0
		});

		test('midnatt', morning, {
			hour: 0,
			minute: 0,
			second: 0,
			milliOfSecond: 0
		});

		test('middag', morning, {
			hour: 12,
			minute: 0,
			second: 0,
			milliOfSecond: 0
		});

		/*
		 * `halv tolv` is half an hour before twelve, where the English
		 * `half twelve` is half an hour after it.
		 */
		test('halv tolv', morning, {
			hour: 11,
			minute: 30,
			second: 0,
			milliOfSecond: 0
		});

		test('kvart i tolv', morning, {
			hour: 11,
			minute: 45,
			second: 0,
			milliOfSecond: 0
		});

		test('kvart över tolv', morning, {
			hour: 12,
			minute: 15,
			second: 0,
			milliOfSecond: 0
		});

		test('fem i tolv', morning, {
			hour: 11,
			minute: 55,
			second: 0,
			milliOfSecond: 0
		});

		test('3 em', morning, {
			hour: 15,
			minute: 0,
			second: 0,
			milliOfSecond: 0
		});

		test('9 fm', morning, {
			hour: 9,
			minute: 0,
			second: 0,
			milliOfSecond: 0
		});

		test('om 2 timmar', morning, {
			hour: 12,
			minute: 0,
			second: 0,
			milliOfSecond: 0
		});

		test('2 timmar sedan', morning, {
			hour: 8,
			minute: 0,
			second: 0,
			milliOfSecond: 0
		});
	});
});
