import { BigInteger } from 'numeric-types/integer';

import { mapOrdinal } from '@ecolect/type-numbers';

import { EnglishLanguage } from '../src/EnglishLanguage.js';
import { ordinalGraph } from '../src/ordinalGraph.js';

import { testRunner } from './helpers.js';

const test = testRunner(new EnglishLanguage(), ordinalGraph, mapOrdinal);

describe('English', function() {
	describe('Ordinal', function() {
		test('1', {}, BigInteger.fromNumber(1));

		test('1st', {}, BigInteger.fromNumber(1));

		test('2 1st', {}, BigInteger.fromNumber(21));

		test('stuff st', {}, null);
	});
});
