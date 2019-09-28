import { en } from '../../../src/language/en';
import { testRunner } from '../helpers';

const test = testRunner(en, 'date-time');

describe('English', function() {


	describe('Date & Time', function() {
		test('jan 12th', { now: new Date(2010, 0, 1, 13, 30) }, {
			period: 'day',
			precision: 'normal',

			year: 2010,
			month: 0,
			day: 12,
			hour: 13,
			minute: 30,
			second: 0
		});

		test('12:10, jan 12th', { now: new Date(2010, 0, 1, 13, 30) }, {
			period: 'minute',
			precision: 'normal',

			year: 2010,
			month: 0,
			day: 12,
			hour: 12,
			minute: 10,
			second: 0
		});

		test('12:10 jan 12th', { now: new Date(2010, 0, 1, 13, 30) }, {
			period: 'minute',
			precision: 'normal',

			year: 2010,
			month: 0,
			day: 12,
			hour: 12,
			minute: 10,
			second: 0
		});

		test('jan 12th 12:10', { now: new Date(2010, 0, 1, 13, 30) }, {
			period: 'minute',
			precision: 'normal',

			year: 2010,
			month: 0,
			day: 12,
			hour: 12,
			minute: 10,
			second: 0
		});

		test('on jan 12th at 12:10', { now: new Date(2010, 0, 1, 13, 30) }, {
			period: 'minute',
			precision: 'normal',

			year: 2010,
			month: 0,
			day: 12,
			hour: 12,
			minute: 10,
			second: 0
		});

		test('14:15', { now: new Date(2010, 0, 1, 13, 30) }, {
			period: 'minute',
			precision: 'normal',

			year: 2010,
			month: 0,
			day: 1,
			hour: 14,
			minute: 15,
			second: 0
		});

		test('14:10, today', { now: new Date(2010, 0, 1, 13, 30) }, {
			period: 'minute',
			precision: 'normal',

			year: 2010,
			month: 0,
			day: 1,
			hour: 14,
			minute: 10,
			second: 0
		});

		test('11/15', { now: new Date(2010, 0, 1, 13, 30) }, {
			period: 'day',
			precision: 'normal',

			year: 2010,
			month: 10,
			day: 15,
			hour: 13,
			minute: 30,
			second: 0
		});

		test('in 2 days', { now: new Date(2010, 0, 1, 13, 30) }, {
			period: 'day',
			precision: 'normal',

			year: 2010,
			month: 0,
			day: 3,
			hour: 13,
			minute: 30,
			second: 0
		});

		test('in 5 hours', { now: new Date(2010, 0, 1, 13, 30) }, {
			period: 'hour',
			precision: 'normal',

			year: 2010,
			month: 0,
			day: 1,
			hour: 18,
			minute: 30,
			second: 0
		});

		test('in 2 days and 3 hours', { now: new Date(2010, 0, 1, 13, 30) }, {
			period: 'hour',
			precision: 'normal',

			year: 2010,
			month: 0,
			day: 3,
			hour: 16,
			minute: 30,
			second: 0
		});

		test('in 3 hours and 2 days', { now: new Date(2010, 0, 1, 13, 30) }, {
			period: 'hour',
			precision: 'normal',

			year: 2010,
			month: 0,
			day: 3,
			hour: 16,
			minute: 30,
			second: 0
		});

		test('in 2 months and 2 days', { now: new Date(2010, 0, 1, 13, 30) }, {
			period: 'day',
			precision: 'normal',

			year: 2010,
			month: 2,
			day: 3,
			hour: 13,
			minute: 30,
			second: 0
		});

		test('2 am in 5 days', { now: new Date(2010, 0, 1, 13, 30) }, {
			period: 'hour',
			precision: 'normal',

			year: 2010,
			month: 0,
			day: 6,
			hour: 2,
			minute: 0,
			second: 0
		});
	});


});
