
import { EnglishLanguage } from '../../../src/language/en/EnglishLanguage.js';
import { timeGraph } from '../../../src/language/en/timeGraph.js';
import { mapTime } from '../../../src/type-datetime/index.js';

import { testRunner } from './helpers.js';

const test = testRunner(new EnglishLanguage(), timeGraph, mapTime);

describe('English', function() {

	describe('Time', function() {
		describe('Exactish', function() {
			test('00:00', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 0,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('00:00', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 0,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('330', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 15,
				minute: 30,
				second: 0,
				millisecond: 0
			});

			test('330', { now: new Date(2010, 0, 1, 2, 30) }, {
				hour: 3,
				minute: 30,
				second: 0,
				millisecond: 0
			});

			test('3:30', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 15,
				minute: 30,
				second: 0,
				millisecond: 0
			});

			test('3:30 PM', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 15,
				minute: 30,
				second: 0,
				millisecond: 0
			});

			test('3:30 p.m.', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 15,
				minute: 30,
				second: 0,
				millisecond: 0
			});

			test('3 a.m.', {}, {
				hour: 3,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('3 am', {}, {
				hour: 3,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('12 a.m.', {}, {
				hour: 0,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('20 a.m.', {}, {
				hour: 20,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('7 p.m.', {}, {
				hour: 19,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('12 p.m.', {}, {
				hour: 12,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('22 p.m.', {}, {
				hour: 22,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('at 3', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 15,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('at 9', { now: new Date(2026, 10, 8, 0, 30) }, {
				hour: 9,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('11:12:13', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 23,
				minute: 12,
				second: 13,
				millisecond: 0
			});
		});

		describe('With a point', function() {
			test('12.30', { now: new Date(2010, 0, 1, 10, 0) }, {
				hour: 12,
				minute: 30,
				second: 0,
				millisecond: 0
			});

			test('9.15', { now: new Date(2010, 0, 1, 8, 0) }, {
				hour: 9,
				minute: 15,
				second: 0,
				millisecond: 0
			});

			test('3.30 pm', { now: new Date(2010, 0, 1, 10, 0) }, {
				hour: 15,
				minute: 30,
				second: 0,
				millisecond: 0
			});

			test('19.45', { now: new Date(2010, 0, 1, 10, 0) }, {
				hour: 19,
				minute: 45,
				second: 0,
				millisecond: 0
			});

			test('10.75', { now: new Date(2010, 0, 1, 10, 0) }, null);
		});

		describe('Invalid', function() {
			test('25', {}, null);

			test('25 a.m.', {}, null);

			test('10:75', { now: new Date(2010, 0, 1, 13, 30) }, null);

			test('10:60', { now: new Date(2026, 10, 8, 10, 0) }, null);

			test('24:30', { now: new Date(2026, 10, 8, 10, 0) }, null);

			test('10:59:60', { now: new Date(2026, 10, 8, 10, 0) }, null);

			test('5 minutes to 25', { now: new Date(2010, 0, 1, 13, 30) }, null);

			test('0 pm', { now: new Date(2026, 10, 8, 10, 0) }, null);

			test('1,000', { now: new Date(2026, 10, 8, 13, 0) }, null);
		});

		describe('Expressive', function() {
			test('quarter to twelve', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 23,
				minute: 45,
				second: 0,
				millisecond: 0
			});

			test('15 before 12', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 23,
				minute: 45,
				second: 0,
				millisecond: 0
			});

			test('half before 12', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 23,
				minute: 30,
				second: 0,
				millisecond: 0
			});


			test('3 quarters til 12', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 23,
				minute: 15,
				second: 0,
				millisecond: 0
			});

			test('15 minutes before 3 pm', {}, {
				hour: 14,
				minute: 45,
				second: 0,
				millisecond: 0
			});

			test('half past twelve', { now: new Date(2010, 0, 1, 10, 30) }, {
				hour: 12,
				minute: 30,
				second: 0,
				millisecond: 0
			});

			test('half twelve', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 0,
				minute: 30,
				second: 0,
				millisecond: 0
			});

			test('midnight', {}, {
				hour: 0,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('noon', {}, {
				hour: 12,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('5 minutes to midnight', {}, {
				hour: 23,
				minute: 55,
				second: 0,
				millisecond: 0
			});
		});

		describe('Relative', function() {
			test('in 4 hours', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 17,
				minute: 30,
				second: 0,
				millisecond: 0
			});

			test('in 5 minutes', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 13,
				minute: 35,
				second: 0,
				millisecond: 0
			});

			test('5 minutes', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 13,
				minute: 35,
				second: 0,
				millisecond: 0
			});

			test('in 4 hours 10 minutes', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 17,
				minute: 40,
				second: 0,
				millisecond: 0
			});

			test('in 4 hours and 10 minutes', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 17,
				minute: 40,
				second: 0,
				millisecond: 0
			});

			test('in 45 minutes', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 14,
				minute: 15,
				second: 0,
				millisecond: 0
			});

			// An amount that moves past the times that can be shown gives no time
			test('in 9999999999999 minutes', { now: new Date(2026, 10, 8, 13, 30) }, null);

			test('at in 4 hours', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 17,
				minute: 30,
				second: 0,
				millisecond: 0
			});

			test('45 minutes ago', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 12,
				minute: 45,
				second: 0,
				millisecond: 0
			});

			test('1 hour and 45 minutes ago', { now: new Date(2010, 0, 1, 13, 30) }, {
				hour: 11,
				minute: 45,
				second: 0,
				millisecond: 0
			});
		});

		describe('Precision', function() {
			test('7 ish', { now: new Date(2010, 0, 1, 13, 30) }, {
				//precision: 'approximate',

				hour: 19,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('7 pm ish', { now: new Date(2010, 0, 1, 13, 30) }, {
				//precision: 'approximate',

				hour: 19,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('7 amish', { now: new Date(2010, 0, 1, 13, 30) }, {
				//precision: 'approximate',

				hour: 7,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('7 pmish', { now: new Date(2010, 0, 1, 5, 30) }, {
				//precision: 'approximate',

				hour: 19,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('08:15 approximately', { now: new Date(2010, 0, 1, 13, 30) }, {
				//precision: 'approximate',

				hour: 20,
				minute: 15,
				second: 0,
				millisecond: 0
			});

			test('around 7', { now: new Date(2010, 0, 1, 13, 30) }, {
				//precision: 'approximate',

				hour: 19,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('exactly 7 a.m.', { now: new Date(2010, 0, 1, 13, 30) }, {
				//precision: 'exact',

				hour: 7,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('18:00 sharp', { now: new Date(2010, 0, 1, 19, 30) }, {
				//precision: 'exact',

				hour: 18,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('7 p.m. sharp', {}, {
				//precision: 'exact',

				hour: 19,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('7 a.m. sharp', {}, {
				//precision: 'exact',

				hour: 7,
				minute: 0,
				second: 0,
				millisecond: 0
			});
		});

		describe('Parts of the day', function() {
			const morning = { now: new Date(2010, 0, 1, 10, 0) };

			test('morning', morning, {
				hour: 9,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('in the morning', morning, {
				hour: 9,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('lunch', morning, {
				hour: 12,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('at lunch', morning, {
				hour: 12,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('after lunch', morning, {
				hour: 13,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('before lunch', morning, {
				hour: 11,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('afternoon', morning, {
				hour: 15,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('evening', morning, {
				hour: 19,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('tonight', morning, {
				hour: 19,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('night', morning, {
				hour: 22,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('last night', morning, {
				hour: 22,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('start of day', morning, {
				hour: 9,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('first thing', morning, {
				hour: 9,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('end of day', morning, {
				hour: 17,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('end of the day', morning, {
				hour: 17,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('eod', morning, {
				hour: 17,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('close of business', morning, {
				hour: 17,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('cob', morning, {
				hour: 17,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			// An hour next to a part of the day is in that part
			test('9 in the morning', morning, {
				hour: 9,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('9 in the evening', morning, {
				hour: 21,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('3 in the afternoon', morning, {
				hour: 15,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('11 at night', morning, {
				hour: 23,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('2 at night', morning, {
				hour: 2,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('tonight at 8', morning, {
				hour: 20,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('8 tonight', morning, {
				hour: 20,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('7:30 this morning', morning, {
				hour: 7,
				minute: 30,
				second: 0,
				millisecond: 0
			});

			test('evening at 8', morning, {
				hour: 20,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			// The hours come from the dayParts option
			test('morning', { ...morning, dayParts: { morning: 7 } }, {
				hour: 7,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('end of day', { ...morning, dayParts: { endOfDay: 18 } }, {
				hour: 18,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('after lunch', { ...morning, dayParts: { lunch: 11 } }, {
				hour: 12,
				minute: 0,
				second: 0,
				millisecond: 0
			});
		});
	});
});
