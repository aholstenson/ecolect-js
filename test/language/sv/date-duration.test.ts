import { dateDurationGraph } from '../../../src/language/sv/dateDurationGraph.js';
import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { mapDuration } from '../../../src/type-datetime/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), dateDurationGraph, mapDuration);

describe('Swedish', function() {
	describe('Date Duration', function() {
		test('3 dagar', {}, { days: 3 });

		test('1 d', {}, { days: 1 });

		// `en` and `ett` are the words for one, so they count as an amount
		test('en vecka', {}, { weeks: 1 });

		test('ett år', {}, { years: 1 });

		test('två veckor', {}, { weeks: 2 });

		test('2 månader och 3 dagar', {}, { months: 2, days: 3 });

		test('4 v 2 d', {}, { weeks: 4, days: 2 });

		test('1 kvartal', {}, { quarters: 1 });

		test('3 mån', {}, { months: 3 });

		test('inget alls', {}, null);
	});
});
