import { testRunner } from '../helpers';

import { en } from '../../../src/language/en';
import { dateTimeGraph } from '../../../src/language/en/dateTimeGraph';
import { mapDateTime } from '../../../src/time/date-times';
import { LocalDateTime } from 'datetime-types';

const test = testRunner(en, dateTimeGraph, mapDateTime);

describe('English', function() {


	describe('Date & Time', function() {
		test('jan 12th', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 12,
			hour: 13,
			minute: 30,
			second: 0,
			milliOfSecond: 0
		}));

		test('12:10, jan 12th', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 12,
			hour: 12,
			minute: 10,
			second: 0,
			milliOfSecond: 0
		}));

		test('12:10 jan 12th', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 12,
			hour: 12,
			minute: 10,
			second: 0,
			milliOfSecond: 0
		}));

		test('jan 12th 12:10', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 12,
			hour: 12,
			minute: 10,
			second: 0,
			milliOfSecond: 0
		}));

		test('on jan 12th at 12:10', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 12,
			hour: 12,
			minute: 10,
			second: 0,
			milliOfSecond: 0
		}));

		test('14:15', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 1,
			hour: 14,
			minute: 15,
			second: 0,
			milliOfSecond: 0
		}));

		test('14:10, today', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 1,
			hour: 14,
			minute: 10,
			second: 0,
			milliOfSecond: 0
		}));

		test('11/15', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 11,
			dayOfMonth: 15,
			hour: 13,
			minute: 30,
			second: 0,
			milliOfSecond: 0
		}));

		test('in 2 days', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 3,
			hour: 13,
			minute: 30,
			second: 0,
			milliOfSecond: 0
		}));

		test('in 5 hours', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 1,
			hour: 18,
			minute: 30,
			second: 0,
			milliOfSecond: 0
		}));

		test('in 2 days and 3 hours', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 3,
			hour: 16,
			minute: 30,
			second: 0,
			milliOfSecond: 0
		}));

		test('in 3 hours and 2 days', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 3,
			hour: 16,
			minute: 30,
			second: 0,
			milliOfSecond: 0
		}));

		test('in 2 months and 2 days', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 3,
			dayOfMonth: 3,
			hour: 13,
			minute: 30,
			second: 0,
			milliOfSecond: 0
		}));

		test('2 am in 5 days', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			dayOfMonth: 6,
			hour: 2,
			minute: 0,
			second: 0,
			milliOfSecond: 0
		}));
	});
});
