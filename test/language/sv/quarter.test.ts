import { quarterGraph } from '../../../src/language/sv/quarterGraph.js';
import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { mapQuarter } from '../../../src/type-datetime/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), quarterGraph, mapQuarter);

describe('Swedish', function() {
	describe('Quarter', function() {
		test('q1', { now: new Date(2018, 0, 1) }, {
			start: { year: 2018, month: 1, dayOfMonth: 1 },
			end: { year: 2018, month: 3, dayOfMonth: 31 }
		});

		test('kvartal 2', { now: new Date(2018, 0, 1) }, {
			start: { year: 2018, month: 4, dayOfMonth: 1 },
			end: { year: 2018, month: 6, dayOfMonth: 30 }
		});

		test('tredje kvartalet', { now: new Date(2018, 0, 1) }, {
			start: { year: 2018, month: 7, dayOfMonth: 1 },
			end: { year: 2018, month: 9, dayOfMonth: 30 }
		});

		test('detta kvartal', { now: new Date(2018, 4, 15) }, {
			start: { year: 2018, month: 4, dayOfMonth: 1 },
			end: { year: 2018, month: 6, dayOfMonth: 30 }
		});

		test('förra kvartalet', { now: new Date(2018, 4, 15) }, {
			start: { year: 2018, month: 1, dayOfMonth: 1 },
			end: { year: 2018, month: 3, dayOfMonth: 31 }
		});

		test('nästa kvartal', { now: new Date(2018, 4, 15) }, {
			start: { year: 2018, month: 7, dayOfMonth: 1 },
			end: { year: 2018, month: 9, dayOfMonth: 30 }
		});
	});
});
