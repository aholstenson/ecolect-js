import { dateIntervalGraph } from '../../../src/language/sv/dateIntervalGraph.js';
import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { mapDateInterval } from '../../../src/type-datetime/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), dateIntervalGraph, mapDateInterval);

// Sweden starts weeks on Monday and the first week of the year contains January 4th
const iso = { weekStartsOn: 1, firstWeekContainsDate: 4 };

describe('Swedish', () => {
	describe('Date Interval', () => {
		test('2018', {}, {
			start: { year: 2018, month: 1, dayOfMonth: 1 },
			end: { year: 2018, month: 12, dayOfMonth: 31 }
		});

		test('februari 2018', { now: new Date(2010, 2, 1) }, {
			start: { year: 2018, month: 2, dayOfMonth: 1 },
			end: { year: 2018, month: 2, dayOfMonth: 28 }
		});

		test('2018 till 2019', { now: new Date(2010, 2, 1) }, {
			start: { year: 2018, month: 1, dayOfMonth: 1 },
			end: { year: 2019, month: 12, dayOfMonth: 31 }
		});

		test('februari till mars', { now: new Date(2010, 2, 1) }, {
			start: { year: 2010, month: 2, dayOfMonth: 1 },
			end: { year: 2010, month: 3, dayOfMonth: 31 }
		});

		test('mellan februari och mars 2009', { now: new Date(2010, 8, 1) }, {
			start: { year: 2009, month: 2, dayOfMonth: 1 },
			end: { year: 2009, month: 3, dayOfMonth: 31 }
		});

		test('2018-01-01 till 2018-01-05', {}, {
			start: { year: 2018, month: 1, dayOfMonth: 1 },
			end: { year: 2018, month: 1, dayOfMonth: 5 }
		});

		test('idag', { now: new Date(2012, 8, 1) }, {
			start: { year: 2012, month: 9, dayOfMonth: 1 },
			end: { year: 2012, month: 9, dayOfMonth: 1 }
		});

		test('vecka 42', { now: new Date(2012, 8, 1), ...iso }, {
			start: { year: 2012, month: 10, dayOfMonth: 15 },
			end: { year: 2012, month: 10, dayOfMonth: 21 }
		});

		test('när som helst', { now: new Date(2012, 8, 3) }, {
			start: null,
			end: null
		});

		test('i framtiden', { now: new Date(2012, 8, 3) }, {
			start: { year: 2012, month: 9, dayOfMonth: 4 },
			end: null
		});

		test('efter idag', { now: new Date(2012, 8, 3) }, {
			start: { year: 2012, month: 9, dayOfMonth: 4 },
			end: null
		});

		test('före idag', { now: new Date(2012, 8, 3) }, {
			start: null,
			end: { year: 2012, month: 9, dayOfMonth: 2 }
		});

		test('till idag', { now: new Date(2012, 8, 3) }, {
			start: null,
			end: { year: 2012, month: 9, dayOfMonth: 3 }
		});

		/*
		 * Rolling ranges are counted from the current day, which is
		 * Wednesday September 5th 2012 in these tests.
		 */

		test('de senaste 7 dagarna', { now: new Date(2012, 8, 5) }, {
			start: { year: 2012, month: 8, dayOfMonth: 30 },
			end: { year: 2012, month: 9, dayOfMonth: 5 }
		});

		test('senaste 3 månaderna', { now: new Date(2012, 8, 5) }, {
			start: { year: 2012, month: 6, dayOfMonth: 6 },
			end: { year: 2012, month: 9, dayOfMonth: 5 }
		});

		test('den senaste veckan', { now: new Date(2012, 8, 5) }, {
			start: { year: 2012, month: 8, dayOfMonth: 30 },
			end: { year: 2012, month: 9, dayOfMonth: 5 }
		});

		test('de kommande 7 dagarna', { now: new Date(2012, 8, 5) }, {
			start: { year: 2012, month: 9, dayOfMonth: 5 },
			end: { year: 2012, month: 9, dayOfMonth: 11 }
		});

		/*
		 * A single period on its own keeps meaning the calendar period, so
		 * `förra veckan` is the previous week and not the last seven days.
		 */
		test('förra veckan', { now: new Date(2012, 8, 5), ...iso }, {
			start: { year: 2012, month: 8, dayOfMonth: 27 },
			end: { year: 2012, month: 9, dayOfMonth: 2 }
		});

		test('nästa vecka', { now: new Date(2012, 8, 5), ...iso }, {
			start: { year: 2012, month: 9, dayOfMonth: 10 },
			end: { year: 2012, month: 9, dayOfMonth: 16 }
		});

		test('sedan 2011', { now: new Date(2012, 8, 5) }, {
			start: { year: 2011, month: 1, dayOfMonth: 1 },
			end: { year: 2012, month: 9, dayOfMonth: 5 }
		});

		test('hittills i år', { now: new Date(2012, 8, 5) }, {
			start: { year: 2012, month: 1, dayOfMonth: 1 },
			end: { year: 2012, month: 9, dayOfMonth: 5 }
		});

		test('hittills i månaden', { now: new Date(2012, 8, 5) }, {
			start: { year: 2012, month: 9, dayOfMonth: 1 },
			end: { year: 2012, month: 9, dayOfMonth: 5 }
		});

		test('under de senaste 7 dagarna', { now: new Date(2012, 8, 5) }, {
			start: { year: 2012, month: 8, dayOfMonth: 30 },
			end: { year: 2012, month: 9, dayOfMonth: 5 }
		});

		// A duration on its own is the day it lands on, not the range up to it
		test('7 dagar', { now: new Date(2012, 8, 5) }, {
			start: { year: 2012, month: 9, dayOfMonth: 12 },
			end: { year: 2012, month: 9, dayOfMonth: 12 }
		});
	});
});
