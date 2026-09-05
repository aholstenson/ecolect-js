import { LocalDateTime } from 'datetime-types';


import { dateTimeGraph } from '../../../src/language/sv/dateTimeGraph.js';
import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { mapDateTime } from '../../../src/type-datetime/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), dateTimeGraph, mapDateTime);

const now = { now: new Date(2010, 0, 1, 13, 30) };

describe('Swedish', function() {
	describe('Date & Time', function() {
		test('12:e januari', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 12,
			hour: 13,
			minute: 30,
			second: 0,
			milliOfSecond: 0
		}));

		test('12 jan 12:10', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 12,
			hour: 12,
			minute: 10,
			second: 0,
			milliOfSecond: 0
		}));

		test('kl 15 den 12 januari', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 12,
			hour: 15,
			minute: 0,
			second: 0,
			milliOfSecond: 0
		}));

		test('14:00', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 1,
			hour: 14,
			minute: 0,
			second: 0,
			milliOfSecond: 0
		}));

		test('om 2 dagar och 2 timmar', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 3,
			hour: 15,
			minute: 30,
			second: 0,
			milliOfSecond: 0
		}));
	});
});
