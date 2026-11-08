import { BigDecimal } from 'numeric-types/decimal';


import { en } from '../../../src/language/en/index.js';
import { EnglishLanguage } from '../../../src/language/en/EnglishLanguage.js';
import { numberGraph } from '../../../src/language/en/numberGraph.js';
import { mapNumber } from '../../../src/type-numbers/index.js';
import { numberValue } from '../../../src/values/index.js';

import { testRunner } from './helpers.js';

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

		test('minus one hundred five', {}, BigDecimal.fromNumber(-105));

		test('-2 thousand 5', {}, BigDecimal.fromNumber(-2005));

		test('1e3', {}, BigDecimal.fromNumber(1000));

		test('1e-3', {}, BigDecimal.fromNumber(0.001));

		test('1.4e3', {}, BigDecimal.fromNumber(1400));

		test('1.5 2', {}, null);

		test('1,000.5', {}, BigDecimal.fromNumber(1000.5));

		describe('Long input', function() {
			const matcher = numberValue().matcher(en);

			it('Repeated suffix words are matched quickly', async function() {
				const start = performance.now();
				await matcher.match(Array(18).fill('1 thousand').join(' '));
				expect(performance.now() - start).toBeLessThan(500);
			}, 1000);
		});
	});
});
