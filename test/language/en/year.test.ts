import { testRunner } from '../helpers';

import { en } from '../../../src/language/en';
import { yearGraph } from '../../../src/language/en/yearGraph';
import { mapYear } from '../../../src/time/years';

const test = testRunner(en, yearGraph, mapYear);

describe('English', function() {

	describe('Year', function() {
		test('2018', {}, {
			year: 2018,
		});

		test('this year', {}, {
			year: new Date().getFullYear(),
		});

		test('last year', {}, {
			year: new Date().getFullYear() - 1,
		});

		test('previous year', {}, {
			year: new Date().getFullYear() - 1,
		});

		test('in 4 years', { now: new Date(2010, 0, 1) }, {
			year: 2014,
		});

		test('4 years ago', { now: new Date(2010, 0, 1) }, {
			year: 2006,
		});
	});

});
