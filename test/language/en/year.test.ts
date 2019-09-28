import { en } from '../../../src/language/en';
import { testRunner } from '../helpers';

const test = testRunner(en, 'year');

describe('English', function() {

	describe('Year', function() {
		test('2018', {}, {
			period: 'year',
			year: 2018,
			month: 0,
			day: 1
		});

		test('this year', {}, {
			period: 'year',
			year: new Date().getFullYear(),
			month: 0,
			day: 1
		});

		test('last year', {}, {
			period: 'year',
			year: new Date().getFullYear() - 1,
			month: 0,
			day: 1
		});

		test('previous year', {}, {
			period: 'year',
			year: new Date().getFullYear() - 1,
			month: 0,
			day: 1
		});

		test('in 4 years', { now: new Date(2010, 0, 1) }, {
			period: 'year',
			year: 2014,
			month: 0,
			day: 1
		});

		test('4 years ago', { now: new Date(2010, 0, 1) }, {
			period: 'year',
			year: 2006,
			month: 0,
			day: 1
		});
	});

});
