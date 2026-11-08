import { BigInteger } from 'numeric-types/integer';


import { ordinalGraph } from '../../../src/language/sv/ordinalGraph.js';
import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { mapOrdinal } from '../../../src/type-numbers/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), ordinalGraph, mapOrdinal);

describe('Swedish', function() {
	describe('Ordinal', function() {
		test('1', {}, BigInteger.fromNumber(1));

		// Swedish marks a position after a digit with a colon
		test('1:a', {}, BigInteger.fromNumber(1));

		test('3:e', {}, BigInteger.fromNumber(3));

		test('12:e', {}, BigInteger.fromNumber(12));

		test('första', {}, BigInteger.fromNumber(1));

		test('tredje', {}, BigInteger.fromNumber(3));

		test('tolfte', {}, BigInteger.fromNumber(12));

		test('tjugoförsta', {}, BigInteger.fromNumber(21));

		test('trettioförsta', {}, BigInteger.fromNumber(31));

		test('den femte', {}, BigInteger.fromNumber(5));

		test('hundrade', {}, BigInteger.fromNumber(100));

		test('tusende', {}, BigInteger.fromNumber(1000));

		// A position can end a compound number word
		test('hundraförsta', {}, BigInteger.fromNumber(101));

		test('tvåhundrafemte', {}, BigInteger.fromNumber(205));

		test('tvåhundratjugoandra', {}, BigInteger.fromNumber(222));

		test('tvåhundrade', {}, BigInteger.fromNumber(200));

		test('tretusende', {}, BigInteger.fromNumber(3000));

		test('tusentredje', {}, BigInteger.fromNumber(1003));

		test('den tvåhundrafemte', {}, BigInteger.fromNumber(205));

		test('hundra femte', {}, BigInteger.fromNumber(105));

		test('tjugo första', {}, BigInteger.fromNumber(21));

		// The number before a position must end in a scale word or a whole ten
		test('fem första', {}, null);

		test('tjugo tjugonde', {}, null);

		test('något :e', {}, null);
	});
});
