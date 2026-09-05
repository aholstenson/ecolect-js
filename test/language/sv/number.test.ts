import { BigDecimal } from 'numeric-types/decimal';


import { numberGraph } from '../../../src/language/sv/numberGraph.js';
import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { mapNumber } from '../../../src/type-numbers/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), numberGraph, mapNumber);

describe('Swedish', function() {
	describe('Numbers', function() {
		test('ett', {}, BigDecimal.fromNumber(1));

		test('1', {}, BigDecimal.fromNumber(1));

		// Swedish writes the fraction after a comma
		test('1,4', {}, BigDecimal.fromNumber(1.4));

		test('2,5 miljoner', {}, BigDecimal.fromNumber(2500000));

		test('tusen', {}, BigDecimal.fromNumber(1000));

		test('ett tusen', {}, BigDecimal.fromNumber(1000));

		test('1,2 tusen', {}, BigDecimal.fromNumber(1200));

		test('1 400', {}, BigDecimal.fromNumber(1400));

		test('-100', {}, BigDecimal.fromNumber(-100));

		test('minus en miljon', {}, BigDecimal.fromNumber(-1000000));

		test('negativt 20', {}, BigDecimal.fromNumber(-20));

		test('1,5e3', {}, BigDecimal.fromNumber(1500));
	});
});
