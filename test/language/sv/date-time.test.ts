import { LocalDateTime } from 'datetime-types';


import { dateTimeGraph } from '../../../src/language/sv/dateTimeGraph.js';
import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { DateOrder, mapDateTime } from '../../../src/type-datetime/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), dateTimeGraph, mapDateTime);

const now = { now: new Date(2010, 0, 1, 13, 30) };

describe('Swedish', function() {
	describe('Date & Time', function() {
		test('12 januari', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 12,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('januari 12', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 12,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('januari 2018', now, LocalDateTime.from({
			year: 2018,
			month: 1,
			day: 1,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('12 januari 12:10', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 12,
			hour: 12,
			minute: 10,
			second: 0,
			millisecond: 0
		}));

		test('12:e januari', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 12,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('12 jan 12:10', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 12,
			hour: 12,
			minute: 10,
			second: 0,
			millisecond: 0
		}));

		test('kl 15 den 12 januari', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 12,
			hour: 15,
			minute: 0,
			second: 0,
			millisecond: 0
		}));

		test('14:00', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 1,
			hour: 14,
			minute: 0,
			second: 0,
			millisecond: 0
		}));

		// Four digits after a day and a month are the year and not a time
		test('12 nov 2026', now, LocalDateTime.from({
			year: 2026,
			month: 11,
			day: 12,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('12/11 2026', { ...now, dateOrder: DateOrder.DayMonthYear }, LocalDateTime.from({
			year: 2026,
			month: 11,
			day: 12,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('12.11.2026', { ...now, dateOrder: DateOrder.DayMonthYear }, LocalDateTime.from({
			year: 2026,
			month: 11,
			day: 12,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('den 12 november 2026 kl 15', now, LocalDateTime.from({
			year: 2026,
			month: 11,
			day: 12,
			hour: 15,
			minute: 0,
			second: 0,
			millisecond: 0
		}));

		// The month and the day give the date after a day of the week
		test('torsdag 12 november', now, LocalDateTime.from({
			year: 2010,
			month: 11,
			day: 12,
			hour: 13,
			minute: 30,
			second: 0,
			millisecond: 0
		}));

		test('torsdagen den 12 november kl 15', now, LocalDateTime.from({
			year: 2010,
			month: 11,
			day: 12,
			hour: 15,
			minute: 0,
			second: 0,
			millisecond: 0
		}));

		// A `kvart` is 15 minutes and not a quarter of a year
		test('om en kvart', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 1,
			hour: 13,
			minute: 45,
			second: 0,
			millisecond: 0
		}));

		test('för en kvart sedan', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 1,
			hour: 13,
			minute: 15,
			second: 0,
			millisecond: 0
		}));

		test('om 2 dagar och 2 timmar', now, LocalDateTime.from({
			year: 2010,
			month: 1,
			day: 3,
			hour: 15,
			minute: 30,
			second: 0,
			millisecond: 0
		}));
	});
});
