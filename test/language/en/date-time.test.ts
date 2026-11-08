import { LocalDateTime } from 'datetime-types';


import { dateTimeGraph } from '../../../src/language/en/dateTimeGraph.js';
import { EnglishLanguage } from '../../../src/language/en/EnglishLanguage.js';
import { mapDateTime } from '../../../src/type-datetime/index.js';

import { testRunner } from './helpers.js';

const test = testRunner(new EnglishLanguage(), dateTimeGraph, mapDateTime);

describe('English', function() {
	describe('Date & Time', function() {
		test('january 12', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 12,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('12 january', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 12,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('january 2018', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2018,
			month: 1,
			day: 1,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('january 12 12:10', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 12,
			hour: 12,
			minute: 10,
			second: 0,
			millisecond: 0
		}));

		test('jan 12th', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 12,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('12:10, jan 12th', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 12,
			hour: 12,
			minute: 10,
			second: 0,
			millisecond: 0
		}));

		test('12:10 jan 12th', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 12,
			hour: 12,
			minute: 10,
			second: 0,
			millisecond: 0
		}));

		test('jan 12th 12:10', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 12,
			hour: 12,
			minute: 10,
			second: 0,
			millisecond: 0
		}));

		test('on jan 12th at 12:10', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 12,
			hour: 12,
			minute: 10,
			second: 0,
			millisecond: 0
		}));

		test('14:15', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 1,
			hour: 14,
			minute: 15,
			second: 0,
			millisecond: 0
		}));

		test('14:10, today', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 1,
			hour: 14,
			minute: 10,
			second: 0,
			millisecond: 0
		}));

		test('11/15', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 11,
			day: 15,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('in 2 days', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 3,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('in 5 hours', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 1,
			hour: 18,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('in 2 days and 3 hours', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 3,
			hour: 16,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('in 3 hours and 2 days', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 3,
			hour: 16,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('in 2 months and 2 days', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 3,
			day: 3,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('2 am in 5 days', { now: new Date(2010, 0, 1, 13, 30) }, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 6,
			hour: 2,
			minute: 0,
			second: 0,
			millisecond: 0
		}));

		// A bare hour on a given day is read as a time in the morning
		test('tomorrow at 9', { now: new Date(2026, 10, 8, 8, 0) }, LocalDateTime.from({
			year: 2026,
			month: 11,
			day: 9,
			hour: 9,
			minute: 0,
			second: 0,
			millisecond: 0
		}));

		test('march 3 at 10:15', { now: new Date(2026, 10, 8, 10, 0) }, LocalDateTime.from({
			year: 2027,
			month: 3,
			day: 3,
			hour: 10,
			minute: 15,
			second: 0,
			millisecond: 0
		}));

		test('september 6 2026 at 9', { now: new Date(2026, 8, 1, 0, 0) }, LocalDateTime.from({
			year: 2026,
			month: 9,
			day: 6,
			hour: 9,
			minute: 0,
			second: 0,
			millisecond: 0
		}));

		// Hours and minutes from now move the date when they pass midnight
		test('in 2 hours', { now: new Date(2026, 10, 8, 23, 30) }, LocalDateTime.from({
			year: 2026,
			month: 11,
			day: 9,
			hour: 1,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('in 30 minutes', { now: new Date(2026, 11, 31, 23, 45) }, LocalDateTime.from({
			year: 2027,
			month: 1,
			day: 1,
			hour: 0,
			minute: 15,
			second: 0,
			millisecond: 0
		}));

		test('in 48 hours', { now: new Date(2026, 10, 8, 12, 0) }, LocalDateTime.from({
			year: 2026,
			month: 11,
			day: 10,
			hour: 12,
			minute: 0,
			second: 0,
			millisecond: 0
		}));

		// A time that has passed today is the same time tomorrow
		test('at 9', { now: new Date(2026, 10, 8, 22, 0) }, LocalDateTime.from({
			year: 2026,
			month: 11,
			day: 9,
			hour: 9,
			minute: 0,
			second: 0,
			millisecond: 0
		}));

		test('at 1', { now: new Date(2026, 10, 8, 14, 0) }, LocalDateTime.from({
			year: 2026,
			month: 11,
			day: 9,
			hour: 1,
			minute: 0,
			second: 0,
			millisecond: 0
		}));

		test('at 14:00', { now: new Date(2026, 10, 8, 22, 0) }, LocalDateTime.from({
			year: 2026,
			month: 11,
			day: 9,
			hour: 14,
			minute: 0,
			second: 0,
			millisecond: 0
		}));

		// A time on a day that the expression names stays on that day
		test('today at 9', { now: new Date(2026, 10, 8, 22, 0) }, LocalDateTime.from({
			year: 2026,
			month: 11,
			day: 8,
			hour: 21,
			minute: 0,
			second: 0,
			millisecond: 0
		}));

		test('at 10', { now: new Date(2026, 10, 8, 23, 30) }, LocalDateTime.from({
			year: 2026,
			month: 11,
			day: 9,
			hour: 10,
			minute: 0,
			second: 0,
			millisecond: 0
		}));

		test('in 9999999999 hours', { now: new Date(2026, 10, 8, 0, 0) }, null);
	});
});
