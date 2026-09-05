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

		test('något :e', {}, null);
	});
});
