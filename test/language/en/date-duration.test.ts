
import { dateDurationGraph } from '../../../src/language/en/dateDurationGraph.js';
import { EnglishLanguage } from '../../../src/language/en/EnglishLanguage.js';
import { mapDuration } from '../../../src/type-datetime/index.js';

import { testRunner } from './helpers.js';

const test = testRunner(new EnglishLanguage(), dateDurationGraph, mapDuration);

describe('English', function() {
	describe('Date Duration', function() {

		test('3 days', {}, {
			days: 3
		});

		test('1 d', {}, {
			days: 1
		});

		test('2 months and 3 days', {}, {
			months: 2,
			days: 3
		});

		test('1 week', {}, {
			weeks: 1
		});

		test('two weeks', {}, {
			weeks: 2
		});

		test('2w', {}, {
			weeks: 2
		});

		test('2wks', {}, {
			weeks: 2
		});

		test('2 months', {}, {
			months: 2
		});

		test('1 year', {}, {
			years: 1
		});

		test('1 year and 2 months', {}, {
			years: 1,
			months: 2
		});

		test('1 year, 2 weeks', {}, {
			years: 1,
			weeks: 2
		});

		test('1 quarter', {}, {
			quarters: 1
		});
	});

});
