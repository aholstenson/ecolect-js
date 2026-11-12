
import { EnglishLanguage } from '../../../src/language/en/EnglishLanguage.js';
import { weekGraph } from '../../../src/language/en/weekGraph.js';
import { mapWeek } from '../../../src/type-datetime/index.js';

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
				day: 8
			},
			end: {
				year: 2018,
				month: 1,
				day: 14
			}
		});

		test('2nd week', { now: new Date(2018, 0, 1), ...iso }, {
			start: {
				year: 2018,
				month: 1,
				day: 8
			},
			end: {
				year: 2018,
				month: 1,
				day: 14
			}
		});

		test('week 0', { now: new Date(2018, 0, 1), ...iso }, null);

		test('week 54', { now: new Date(2018, 0, 1), ...iso }, null);

		test('this week', { now: new Date(2018, 0, 3), ...iso }, {
			start: {
				year: 2018,
				month: 1,
				day: 1
			},
			end: {
				year: 2018,
				month: 1,
				day: 7
			}
		});

		test('week after next', { now: new Date(2018, 0, 3), ...iso }, {
			start: { year: 2018, month: 1, day: 15 },
			end: { year: 2018, month: 1, day: 21 }
		});

		test('the week after next', { now: new Date(2018, 0, 3), ...iso }, {
			start: { year: 2018, month: 1, day: 15 },
			end: { year: 2018, month: 1, day: 21 }
		});

		test('next week', { now: new Date(2018, 0, 3), ...iso }, {
			start: {
				year: 2018,
				month: 1,
				day: 8
			},
			end: {
				year: 2018,
				month: 1,
				day: 14
			}
		});

		test('last week', { now: new Date(2018, 0, 3), ...iso }, {
			start: {
				year: 2017,
				month: 12,
				day: 25
			},
			end: {
				year: 2017,
				month: 12,
				day: 31
			}
		});

		test('previous week', { now: new Date(2018, 0, 3), ...iso }, {
			start: {
				year: 2017,
				month: 12,
				day: 25
			},
			end: {
				year: 2017,
				month: 12,
				day: 31
			}
		});

		// January 3rd 2027 is still in the last week of 2026
		test('week 2', { now: new Date(2027, 0, 3), ...iso }, {
			start: {
				year: 2027,
				month: 1,
				day: 11
			},
			end: {
				year: 2027,
				month: 1,
				day: 17
			}
		});

		test('week 10', { now: new Date(2027, 0, 3), ...iso }, {
			start: {
				year: 2027,
				month: 3,
				day: 8
			},
			end: {
				year: 2027,
				month: 3,
				day: 14
			}
		});

		// The current week on January 3rd 2027 is week 53 of 2026
		test('week 53', { now: new Date(2027, 0, 3), ...iso }, {
			start: {
				year: 2026,
				month: 12,
				day: 28
			},
			end: {
				year: 2027,
				month: 1,
				day: 3
			}
		});

		// December 30th 2025 is in the first week of 2026
		test('week 2', { now: new Date(2025, 11, 30), ...iso }, {
			start: {
				year: 2026,
				month: 1,
				day: 5
			},
			end: {
				year: 2026,
				month: 1,
				day: 11
			}
		});
	});
});
