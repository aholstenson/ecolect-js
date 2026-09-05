import { BigInteger } from 'numeric-types/integer';


import { integerGraph } from '../../../src/language/sv/integerGraph.js';
import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { mapInteger } from '../../../src/type-numbers/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), integerGraph, mapInteger);

describe('Swedish', function() {
	describe('Integer', function() {
		test('0', {}, BigInteger.fromNumber(0));

		test('noll', {}, BigInteger.fromNumber(0));

		test('ett', {}, BigInteger.fromNumber(1));

		test('en', {}, BigInteger.fromNumber(1));

		test('tolv', {}, BigInteger.fromNumber(12));

		test('tjugoett', {}, BigInteger.fromNumber(21));

		test('tjugoen', {}, BigInteger.fromNumber(21));

		test('fyrtiotvå', {}, BigInteger.fromNumber(42));

		test('nittionio', {}, BigInteger.fromNumber(99));

		test('hundra', {}, BigInteger.fromNumber(100));

		test('tvåhundra', {}, BigInteger.fromNumber(200));

		test('tusen', {}, BigInteger.fromNumber(1000));

		test('ett tusen', {}, BigInteger.fromNumber(1000));

		test('två miljoner', {}, BigInteger.fromNumber(2000000));

		test('två dussin', {}, BigInteger.fromNumber(24));

		test('100k', {}, BigInteger.fromNumber(100000));

		// Swedish groups the digits of a large number with a space
		test('1 400', {}, BigInteger.fromNumber(1400));

		test('12 000', {}, BigInteger.fromNumber(12000));

		test('ingenting', {}, null);
	});
});
