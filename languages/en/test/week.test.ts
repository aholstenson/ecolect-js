import { mapWeek } from '@ecolect/type-datetime';

import { EnglishLanguage } from '../src/EnglishLanguage.js';
import { weekGraph } from '../src/weekGraph.js';

import { testRunner } from './helpers.js';

const test = testRunner(new EnglishLanguage(), weekGraph, mapWeek);

// Weeks start on Monday, the first week of the year contains January 4th
const iso = { weekStartsOn: 1, firstWeekContainsDate: 4 };

describe('English', function() {
	describe('Week', function() {
		test('week 2', { now: new Date(2018, 0, 1), ...iso }, {
			start: {
				year: 2018,
				month: 1,
				dayOfMonth: 8
			},
			end: {
				year: 2018,
				month: 1,
				dayOfMonth: 14
			}
		});

		test('2nd week', { now: new Date(2018, 0, 1), ...iso }, {
			start: {
				year: 2018,
				month: 1,
				dayOfMonth: 8
			},
			end: {
				year: 2018,
				month: 1,
				dayOfMonth: 14
			}
		});

		test('week 0', { now: new Date(2018, 0, 1), ...iso }, null);

		test('week 54', { now: new Date(2018, 0, 1), ...iso }, null);

		test('this week', { now: new Date(2018, 0, 3), ...iso }, {
			start: {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			},
			end: {
				year: 2018,
				month: 1,
				dayOfMonth: 7
			}
		});

		test('next week', { now: new Date(2018, 0, 3), ...iso }, {
			start: {
				year: 2018,
				month: 1,
				dayOfMonth: 8
			},
			end: {
				year: 2018,
				month: 1,
				dayOfMonth: 14
			}
		});

		test('last week', { now: new Date(2018, 0, 3), ...iso }, {
			start: {
				year: 2017,
				month: 12,
				dayOfMonth: 25
			},
			end: {
				year: 2017,
				month: 12,
				dayOfMonth: 31
			}
		});

		test('previous week', { now: new Date(2018, 0, 3), ...iso }, {
			start: {
				year: 2017,
				month: 12,
				dayOfMonth: 25
			},
			end: {
				year: 2017,
				month: 12,
				dayOfMonth: 31
			}
		});
	});
});
