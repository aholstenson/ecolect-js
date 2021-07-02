import { mapMonth } from '@ecolect/type-datetime';

import { EnglishLanguage } from '../src/EnglishLanguage';
import { monthGraph } from '../src/monthGraph';

import { testRunner } from './helpers';

const test = testRunner(new EnglishLanguage(), monthGraph, mapMonth);

describe('English', function() {


	describe('Month', function() {

		test('jan', { now: new Date(2010, 0, 1) }, {
			month: 1
		});

		test('january', { now: new Date(2010, 0, 1) }, {
			month: 1
		});

		test('feb', { now: new Date(2010, 0, 1) }, {
			month: 2
		});

		test('february', { now: new Date(2010, 0, 1) }, {
			month: 2
		});

		test('mar', { now: new Date(2010, 0, 1) }, {
			month: 3
		});

		test('march', { now: new Date(2010, 0, 1) }, {
			month: 3
		});

		test('apr', { now: new Date(2010, 0, 1) }, {
			month: 4
		});

		test('april', { now: new Date(2010, 0, 1) }, {
			month: 4
		});

		test('may', { now: new Date(2010, 0, 1) }, {
			month: 5
		});

		test('jun', { now: new Date(2010, 0, 1) }, {
			month: 6
		});

		test('june', { now: new Date(2010, 0, 1) }, {
			month: 6
		});

		test('jul', { now: new Date(2010, 0, 1) }, {
			month: 7
		});

		test('july', { now: new Date(2010, 0, 1) }, {
			month: 7
		});

		test('aug', { now: new Date(2010, 0, 1) }, {
			month: 8
		});

		test('august', { now: new Date(2010, 0, 1) }, {
			month: 8
		});

		test('sep', { now: new Date(2010, 0, 1) }, {
			month: 9
		});

		test('sept', { now: new Date(2010, 0, 1) }, {
			month: 9
		});

		test('september', { now: new Date(2010, 0, 1) }, {
			month: 9
		});

		test('oct', { now: new Date(2010, 0, 1) }, {
			month: 10
		});

		test('october', { now: new Date(2010, 0, 1) }, {
			month: 10
		});

		test('nov', { now: new Date(2010, 0, 1) }, {
			month: 11
		});

		test('november', { now: new Date(2010, 0, 1) }, {
			month: 11
		});

		test('dec', { now: new Date(2010, 0, 1) }, {
			month: 12
		});

		test('december', { now: new Date(2010, 0, 1) }, {
			month: 12
		});

		test('first month', { now: new Date(2010, 5, 2) }, {
			month: 1
		});

		test('5th month', { now: new Date(2010, 5, 2) }, {
			month: 5
		});

		test('third', { now: new Date(2010, 5, 2) }, {
			month: 3
		});

		test('this month', { now: new Date(2010, 5, 2) }, {
			month: 6
		});

		test('next month', { now: new Date(2010, 0, 1) }, {
			month: 2
		});

		test('last month', { now: new Date(2010, 0, 1) }, {
			month: 12
		});

		test('in one month', { now: new Date(2010, 0, 1) }, {
			month: 2
		});

		test('in 4 months', { now: new Date(2010, 0, 1) }, {
			month: 5,
		});

		test('4 months ago', { now: new Date(2010, 0, 1) }, {
			month: 9
		});
	});

});
