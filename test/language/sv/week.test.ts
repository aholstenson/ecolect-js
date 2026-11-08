import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { weekGraph } from '../../../src/language/sv/weekGraph.js';
import { mapWeek } from '../../../src/type-datetime/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), weekGraph, mapWeek);

// Sweden starts weeks on Monday and the first week of the year contains January 4th
const iso = { weekStartsOn: 1, firstWeekContainsDate: 4 };

describe('Swedish', function() {
	describe('Week', function() {
		test('vecka 2', { now: new Date(2018, 0, 1), ...iso }, {
			start: { year: 2018, month: 1, day: 8 },
			end: { year: 2018, month: 1, day: 14 }
		});

		test('v 42', { now: new Date(2018, 0, 1), ...iso }, {
			start: { year: 2018, month: 10, day: 15 },
			end: { year: 2018, month: 10, day: 21 }
		});

		test('andra veckan', { now: new Date(2018, 0, 1), ...iso }, {
			start: { year: 2018, month: 1, day: 8 },
			end: { year: 2018, month: 1, day: 14 }
		});

		test('denna vecka', { now: new Date(2018, 0, 10), ...iso }, {
			start: { year: 2018, month: 1, day: 8 },
			end: { year: 2018, month: 1, day: 14 }
		});

		test('förra veckan', { now: new Date(2018, 0, 10), ...iso }, {
			start: { year: 2018, month: 1, day: 1 },
			end: { year: 2018, month: 1, day: 7 }
		});

		test('nästa vecka', { now: new Date(2018, 0, 10), ...iso }, {
			start: { year: 2018, month: 1, day: 15 },
			end: { year: 2018, month: 1, day: 21 }
		});
	});
});
