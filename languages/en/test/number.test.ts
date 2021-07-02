import { BigDecimal } from 'numeric-types/decimal';

import { mapNumber } from '@ecolect/type-numbers';

import { EnglishLanguage } from '../src/EnglishLanguage';
import { numberGraph } from '../src/numberGraph';

import { testRunner } from './helpers';

const test = testRunner(new EnglishLanguage(), numberGraph, mapNumber);

describe('English', function() {
	describe('Numbers', function() {
		test('one', {}, BigDecimal.fromNumber(1));

		test('1', {}, BigDecimal.fromNumber(1));

		test('1.4', {}, BigDecimal.fromNumber(1.4));

		test('1 4', {}, BigDecimal.fromNumber(14));

		test('thousand', {}, BigDecimal.fromNumber(1000));

		test('one thousand', {}, BigDecimal.fromNumber(1000));

		test('1 thousand', {}, BigDecimal.fromNumber(1000));

		test('1.2 thousand', {}, BigDecimal.fromNumber(1200));

		test('1 400', {}, BigDecimal.fromNumber(1400));

		test('two dozen', {}, BigDecimal.fromNumber(24));

		test('100k', {}, BigDecimal.fromNumber(100000));

		test('-100', {}, BigDecimal.fromNumber(-100));

		test('-1 000', {}, BigDecimal.fromNumber(-1000));

		test('minus one million', {}, BigDecimal.fromNumber(-1000000));

		test('1e3', {}, BigDecimal.fromNumber(1000));

		test('1e-3', {}, BigDecimal.fromNumber(0.001));

		test('1.4e3', {}, BigDecimal.fromNumber(1400));
	});
});
