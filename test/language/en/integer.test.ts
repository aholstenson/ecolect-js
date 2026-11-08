import { BigInteger } from 'numeric-types/integer';


import { en } from '../../../src/language/en/index.js';
import { EnglishLanguage } from '../../../src/language/en/EnglishLanguage.js';
import { integerGraph } from '../../../src/language/en/integerGraph.js';
import { mapInteger } from '../../../src/type-numbers/index.js';
import { integerValue } from '../../../src/values/index.js';
import { expectGrowth } from '../../growth.js';

import { testRunner } from './helpers.js';

const test = testRunner(new EnglishLanguage(), integerGraph, mapInteger);

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

		test('20 billion billion billion', {}, BigInteger.parse('2' + '0'.repeat(28)));

		test('9007199254740993 thousand', {}, BigInteger.parse('9007199254740993000'));

		test('1,000,000', {}, BigInteger.fromNumber(1000000));

		test('1 000', {}, BigInteger.fromNumber(1000));

		test('1,5', {}, null);

		test('1,23', {}, null);

		test('1,0000', {}, null);

		test('1234,567', {}, null);

		test('twenty one', {}, BigInteger.fromNumber(21));

		test('a hundred', {}, BigInteger.fromNumber(100));

		test('one hundred and five', {}, BigInteger.fromNumber(105));

		test('ninety nine', {}, BigInteger.fromNumber(99));

		test('two thousand twenty one', {}, BigInteger.fromNumber(2021));

		test('one hundred twenty three thousand', {}, BigInteger.fromNumber(123000));

		test('a dozen', {}, BigInteger.fromNumber(12));

		test('a hundred thousand', {}, BigInteger.fromNumber(100000));

		test('twenty twenty', {}, null);

		test('one and two', {}, null);

		describe('Long input', function() {
			const matcher = integerValue().matcher(en);

			it('Repeated number words are matched quickly', function() {
				return expectGrowth(
					size => matcher.match('one '.repeat(size)),
					{ from: 65, to: 260, degree: 2 }
				);
			});

			it('Repeated scale words are matched quickly', function() {
				return expectGrowth(
					// The value is too large for an integer, only the time is checked
					size => matcher.match('hundred '.repeat(size)).catch(() => null),
					{ from: 65, to: 260, degree: 2 }
				);
			});
		});

		test('one hundred five', {}, BigInteger.fromNumber(105));

		test('two thousand three hundred', {}, BigInteger.fromNumber(2300));

		test('2 thousand 5', {}, BigInteger.fromNumber(2005));

		test('one thousand 250', {}, BigInteger.fromNumber(1250));

		test('2 thousand 1 000', {}, null);
	});
});
