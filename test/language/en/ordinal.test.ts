import { BigInteger } from 'numeric-types/integer';


import { EnglishLanguage } from '../../../src/language/en/EnglishLanguage.js';
import { ordinalGraph } from '../../../src/language/en/ordinalGraph.js';
import { mapOrdinal } from '../../../src/type-numbers/index.js';

import { testRunner } from './helpers.js';

const test = testRunner(new EnglishLanguage(), ordinalGraph, mapOrdinal);

describe('English', function() {
	describe('Ordinal', function() {
		test('1', {}, BigInteger.fromNumber(1));

		test('1st', {}, BigInteger.fromNumber(1));

		test('2 1st', {}, BigInteger.fromNumber(21));

		test('stuff st', {}, null);

		test('twentieth', {}, BigInteger.fromNumber(20));

		test('eighth', {}, BigInteger.fromNumber(8));

		test('twelfth', {}, BigInteger.fromNumber(12));

		test('twenty first', {}, BigInteger.fromNumber(21));

		test('one hundred second', {}, BigInteger.fromNumber(102));

		test('twenty twelfth', {}, null);

		test('one first', {}, null);

		test('20 billion billion billion', {}, null);

		test('1' + '0'.repeat(400), {}, null);
	});
});
