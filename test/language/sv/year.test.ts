import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { yearGraph } from '../../../src/language/sv/yearGraph.js';
import { mapYear } from '../../../src/type-datetime/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), yearGraph, mapYear);

describe('Swedish', function() {
	describe('Year', function() {
		test('2018', {}, {
			year: 2018,
		});

		test('år 2018', {}, {
			year: 2018,
		});

		test('i år', {}, {
			year: new Date().getFullYear(),
		});

		test('förra året', {}, {
			year: new Date().getFullYear() - 1,
		});

		test('i fjol', {}, {
			year: new Date().getFullYear() - 1,
		});

		test('nästa år', {}, {
			year: new Date().getFullYear() + 1,
		});

		test('om 4 år', { now: new Date(2010, 0, 1) }, {
			year: 2014,
		});

		test('4 år sedan', { now: new Date(2010, 0, 1) }, {
			year: 2006,
		});
	});
});
