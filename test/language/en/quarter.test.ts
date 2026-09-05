
import { EnglishLanguage } from '../../../src/language/en/EnglishLanguage.js';
import { quarterGraph } from '../../../src/language/en/quarterGraph.js';
import { mapQuarter } from '../../../src/type-datetime/index.js';

import { testRunner } from './helpers.js';

const test = testRunner(new EnglishLanguage(), quarterGraph, mapQuarter);

describe('English', function() {
	describe('Quarter', function() {
		test('q1', { now: new Date(2018, 0, 1) }, {
			start: {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			},
			end: {
				year: 2018,
				month: 3,
				dayOfMonth: 31
			}
		});

		test('Q2', { now: new Date(2018, 0, 1) }, {
			start: {
				year: 2018,
				month: 4,
				dayOfMonth: 1
			},
			end: {
				year: 2018,
				month: 6,
				dayOfMonth: 30
			}
		});

		test('quarter 3', { now: new Date(2018, 0, 1) }, {
			start: {
				year: 2018,
				month: 7,
				dayOfMonth: 1
			},
			end: {
				year: 2018,
				month: 9,
				dayOfMonth: 30
			}
		});

		test('4th quarter', { now: new Date(2018, 0, 1) }, {
			start: {
				year: 2018,
				month: 10,
				dayOfMonth: 1
			},
			end: {
				year: 2018,
				month: 12,
				dayOfMonth: 31
			}
		});

		test('first quarter', { now: new Date(2018, 0, 1) }, {
			start: {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			},
			end: {
				year: 2018,
				month: 3,
				dayOfMonth: 31
			}
		});

		test('q0', { now: new Date(2018, 0, 1) }, null);

		test('q5', { now: new Date(2018, 0, 1) }, null);

		test('this quarter', { now: new Date(2018, 4, 15) }, {
			start: {
				year: 2018,
				month: 4,
				dayOfMonth: 1
			},
			end: {
				year: 2018,
				month: 6,
				dayOfMonth: 30
			}
		});

		test('next quarter', { now: new Date(2018, 10, 15) }, {
			start: {
				year: 2019,
				month: 1,
				dayOfMonth: 1
			},
			end: {
				year: 2019,
				month: 3,
				dayOfMonth: 31
			}
		});

		test('last quarter', { now: new Date(2018, 0, 15) }, {
			start: {
				year: 2017,
				month: 10,
				dayOfMonth: 1
			},
			end: {
				year: 2017,
				month: 12,
				dayOfMonth: 31
			}
		});

		test('previous quarter', { now: new Date(2018, 0, 15) }, {
			start: {
				year: 2017,
				month: 10,
				dayOfMonth: 1
			},
			end: {
				year: 2017,
				month: 12,
				dayOfMonth: 31
			}
		});
	});
});
