import { mapTime } from '@ecolect/type-datetime';

import { EnglishLanguage } from '../src/EnglishLanguage';
import { timeGraph } from '../src/timeGraph';

import { testRunner } from './helpers';

const test = testRunner(new EnglishLanguage(), timeGraph, mapTime);

describe('English', function() {

	describe('Time', function() {
		describe('Exactish', function() {
			test('00:00', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 0,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('00:00', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 0,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('330', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 15,
				minute: 30,
				second: 0,
				milliOfSecond: 0
			});

			test('330', { now: new Date(2010, 0, 1, 2, 30) }, {
				hour: 3,
				minute: 30,
				second: 0,
				milliOfSecond: 0
			});

			test('3:30', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 15,
				minute: 30,
				second: 0,
				milliOfSecond: 0
			});

			test('3:30 PM', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 15,
				minute: 30,
				second: 0,
				milliOfSecond: 0
			});

			test('3:30 p.m.', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 15,
				minute: 30,
				second: 0,
				milliOfSecond: 0
			});

			test('3 a.m.', {}, {
				hour: 3,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('3 am', {}, {
				hour: 3,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('12 a.m.', {}, {
				hour: 0,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('20 a.m.', {}, {
				hour: 20,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('7 p.m.', {}, {
				hour: 19,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('12 p.m.', {}, {
				hour: 12,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('22 p.m.', {}, {
				hour: 22,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('at 3', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 15,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('11:12:13', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 23,
				minute: 12,
				second: 13,
				milliOfSecond: 0
			});
		});

		describe('Invalid', function() {
			test('25', {}, null);

			test('25 a.m.', {}, null);

			test('10:75', { now: new Date(2010, 0, 1, 13, 30) }, null);

			test('5 minutes to 25', { now: new Date(2010, 0, 1, 13, 30) }, null);
		});

		describe('Expressive', function() {
			test('quarter to twelve', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 23,
				minute: 45,
				second: 0,
				milliOfSecond: 0
			});

			test('15 before 12', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 23,
				minute: 45,
				second: 0,
				milliOfSecond: 0
			});

			test('half before 12', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 23,
				minute: 30,
				second: 0,
				milliOfSecond: 0
			});


			test('3 quarters til 12', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 23,
				minute: 15,
				second: 0,
				milliOfSecond: 0
			});

			test('15 minutes before 3 pm', {}, {
				hour: 14,
				minute: 45,
				second: 0,
				milliOfSecond: 0
			});

			test('half past twelve', { now: new Date(2010, 0, 1, 10, 30) }, {
				hour: 12,
				minute: 30,
				second: 0,
				milliOfSecond: 0
			});

			test('half twelve', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 0,
				minute: 30,
				second: 0,
				milliOfSecond: 0
			});

			test('midnight', {}, {
				hour: 0,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('noon', {}, {
				hour: 12,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('5 minutes to midnight', {}, {
				hour: 23,
				minute: 55,
				second: 0,
				milliOfSecond: 0
			});
		});

		describe('Relative', function() {
			test('in 4 hours', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 17,
				minute: 30,
				second: 0,
				milliOfSecond: 0
			});

			test('in 5 minutes', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 13,
				minute: 35,
				second: 0,
				milliOfSecond: 0
			});

			test('5 minutes', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 13,
				minute: 35,
				second: 0,
				milliOfSecond: 0
			});

			test('in 4 hours 10 minutes', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 17,
				minute: 40,
				second: 0,
				milliOfSecond: 0
			});

			test('in 4 hours and 10 minutes', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 17,
				minute: 40,
				second: 0,
				milliOfSecond: 0
			});

			test('in 45 minutes', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 14,
				minute: 15,
				second: 0,
				milliOfSecond: 0
			});

			test('at in 4 hours', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 17,
				minute: 30,
				second: 0,
				milliOfSecond: 0
			});

			test('45 minutes ago', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 12,
				minute: 45,
				second: 0,
				milliOfSecond: 0
			});

			test('1 hour and 45 minutes ago', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 11,
				minute: 45,
				second: 0,
				milliOfSecond: 0
			});
		});

		describe('Precision', function() {
			test('7 ish', { now: new Date(2010, 0, 1, 13, 30) }, {
				//precision: 'approximate',

				hour: 19,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('7 pm ish', { now: new Date(2010, 0, 1, 13, 30) }, {
				//precision: 'approximate',

				hour: 19,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('7 amish', { now: new Date(2010, 0, 1, 13, 30) }, {
				//precision: 'approximate',

				hour: 7,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('7 pmish', { now: new Date(2010, 0, 1, 5, 30) }, {
				//precision: 'approximate',

				hour: 19,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('08:15 approximately', { now: new Date(2010, 0, 1, 13, 30) }, {
				//precision: 'approximate',

				hour: 20,
				minute: 15,
				second: 0,
				milliOfSecond: 0
			});

			test('around 7', { now: new Date(2010, 0, 1, 13, 30) }, {
				//precision: 'approximate',

				hour: 19,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('exactly 7 a.m.', { now: new Date(2010, 0, 1, 13, 30) }, {
				//precision: 'exact',

				hour: 7,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('18:00 sharp', { now: new Date(2010, 0, 1, 19, 30) }, {
				//precision: 'exact',

				hour: 18,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('7 p.m. sharp', {}, {
				//precision: 'exact',

				hour: 19,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});

			test('7 a.m. sharp', {}, {
				//precision: 'exact',

				hour: 7,
				minute: 0,
				second: 0,
				milliOfSecond: 0
			});
		});
	});
});
