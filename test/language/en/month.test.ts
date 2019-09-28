import { en } from '../../../src/language/en';
import { testRunner } from '../helpers';

const test = testRunner(en, 'month');

describe('English', function() {


	describe('Month', function() {

		test('jan', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 0,
			day: 1
		});

		test('january', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 0,
			day: 1
		});

		test('feb', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 1,
			day: 1
		});

		test('february', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 1,
			day: 1
		});


		test('mar', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 2,
			day: 1
		});

		test('march', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 2,
			day: 1
		});

		test('apr', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 3,
			day: 1
		});

		test('april', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 3,
			day: 1
		});

		test('may', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 4,
			day: 1
		});

		test('jun', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 5,
			day: 1
		});

		test('june', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 5,
			day: 1
		});

		test('jul', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 6,
			day: 1
		});

		test('july', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 6,
			day: 1
		});

		test('aug', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 7,
			day: 1
		});

		test('august', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 7,
			day: 1
		});

		test('sep', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 8,
			day: 1
		});

		test('sept', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 8,
			day: 1
		});

		test('september', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 8,
			day: 1
		});

		test('oct', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 9,
			day: 1
		});

		test('october', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 9,
			day: 1
		});

		test('nov', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 10,
			day: 1
		});

		test('november', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 10,
			day: 1
		});

		test('dec', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 11,
			day: 1
		});

		test('december', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 11,
			day: 1
		});

		test('first month', { now: new Date(2010, 5, 2) }, {
			period: 'month',
			year: 2010,
			month: 0,
			day: 1
		});

		test('5th month', { now: new Date(2010, 5, 2) }, {
			period: 'month',
			year: 2010,
			month: 4,
			day: 1
		});

		test('third', { now: new Date(2010, 5, 2) }, {
			period: 'month',
			year: 2010,
			month: 2,
			day: 1
		});

		test('this month', { now: new Date(2010, 5, 2) }, {
			period: 'month',
			year: 2010,
			month: 5,
			day: 1
		});

		test('next month', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 1,
			day: 1
		});

		test('last month', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2009,
			month: 11,
			day: 1
		});

		test('in one month', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 1,
			day: 1
		});

		test('in 4 months', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2010,
			month: 4,
			day: 1
		});

		test('4 months ago', { now: new Date(2010, 0, 1) }, {
			period: 'month',
			year: 2009,
			month: 8,
			day: 1
		});
	});

});
