import { monthGraph } from '../../../src/language/sv/monthGraph.js';
import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { mapMonth } from '../../../src/type-datetime/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), monthGraph, mapMonth);

describe('Swedish', function() {
	describe('Month', function() {
		test('jan', { now: new Date(2010, 0, 1) }, { month: 1 });

		test('januari', { now: new Date(2010, 0, 1) }, { month: 1 });

		test('februari', { now: new Date(2010, 0, 1) }, { month: 2 });

		test('mars', { now: new Date(2010, 0, 1) }, { month: 3 });

		test('april', { now: new Date(2010, 0, 1) }, { month: 4 });

		test('maj', { now: new Date(2010, 0, 1) }, { month: 5 });

		test('juni', { now: new Date(2010, 0, 1) }, { month: 6 });

		test('juli', { now: new Date(2010, 0, 1) }, { month: 7 });

		test('augusti', { now: new Date(2010, 0, 1) }, { month: 8 });

		test('sep', { now: new Date(2010, 0, 1) }, { month: 9 });

		test('september', { now: new Date(2010, 0, 1) }, { month: 9 });

		test('oktober', { now: new Date(2010, 0, 1) }, { month: 10 });

		test('november', { now: new Date(2010, 0, 1) }, { month: 11 });

		test('december', { now: new Date(2010, 0, 1) }, { month: 12 });

		test('denna månad', { now: new Date(2010, 2, 15) }, { month: 3 });

		test('förra månaden', { now: new Date(2010, 2, 15) }, { month: 2 });

		test('nästa månad', { now: new Date(2010, 2, 15) }, { month: 4 });

		test('om 2 månader', { now: new Date(2010, 2, 15) }, { month: 5 });

		test('3 månader sedan', { now: new Date(2010, 5, 15) }, { month: 3 });
	});
});
