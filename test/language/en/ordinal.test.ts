import { testRunner } from '../helpers';

import { en } from '../../../src/language/en';
import { ordinalGraph } from '../../../src/language/en/ordinalGraph';
import { mapOrdinal } from '../../../src/numbers/ordinals';
import { BigInteger } from 'numeric-types/integer';

const test = testRunner(en, ordinalGraph, mapOrdinal);

describe('English', function() {

	describe('Ordinal', function() {
		test('1', {}, BigInteger.fromNumber(1));

		test('1st', {}, BigInteger.fromNumber(1));

		test('2 1st', {}, BigInteger.fromNumber(21));

		test('stuff st', {}, null);
	});

});
