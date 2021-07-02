import { BigInteger } from 'numeric-types/integer';

import { mapOrdinal } from '@ecolect/type-numbers';

import { EnglishLanguage } from '../src/EnglishLanguage';
import { ordinalGraph } from '../src/ordinalGraph';

import { testRunner } from './helpers';

const test = testRunner(new EnglishLanguage(), ordinalGraph, mapOrdinal);

describe('English', function() {
	describe('Ordinal', function() {
		test('1', {}, BigInteger.fromNumber(1));

		test('1st', {}, BigInteger.fromNumber(1));

		test('2 1st', {}, BigInteger.fromNumber(21));

		test('stuff st', {}, null);
	});
});
