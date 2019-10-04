import { BigInteger } from 'numeric-types/integer';

import { testRunner } from '../helpers';

import { en } from '../../../src/language/en';
import { integerGraph } from '../../../src/language/en/integerGraph';
import { mapInteger } from '../../../src/numbers/numbers';

const test = testRunner(en, integerGraph, mapInteger);

describe('English', function() {

	describe('Integer', function() {
		test('one', {}, BigInteger.fromNumber(1));

		test('1', {}, BigInteger.fromNumber(1));

		test('1 4', {}, BigInteger.fromNumber(14));

		test('thousand', {}, BigInteger.fromNumber(1000));

		test('one thousand', {}, BigInteger.fromNumber(1000));

		test('1 thousand', {}, BigInteger.fromNumber(1000));

		test('1 400', {}, BigInteger.fromNumber(1400));

		test('two dozen', {}, BigInteger.fromNumber(24));

		test('100k', {}, BigInteger.fromNumber(100000));

		test('-100', {}, null);

		test('-1 000', {}, null);

		test('minus one million', {}, null);

		test('1 thousand thousand', {}, BigInteger.fromNumber(1000000));

		test('one 000', {}, null);

		test('10,000', {}, BigInteger.fromNumber(10000));
	});
});
