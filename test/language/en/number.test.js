import en from '../../../src/language/en';
import { testRunner } from '../helpers';

const test = testRunner(en.number);

describe('English', function() {

	describe('Numbers', function() {
		test('one', {}, { value: 1 });

		test('1', {}, { value: 1 });

		test('1.4', {}, { value: 1.4 });

		test('1 4', {}, { value: 14 });

		test('thousand', {}, { value: 1000 });

		test('one thousand', {}, { value: 1000 });

		test('1 thousand', {}, { value: 1000 });

		test('1.2 thousand', {}, { value: 1200 });

		test('1 400', {}, { value: 1400 });

		test('two dozen', {}, { value: 24 });

		test('100k', {}, { value: 100000 });

		test('-100', {}, { value: -100 });

		test('-1 000', {}, { value: -1000 });

		test('minus one million', {}, { value: -1000000 });

		test('1e3', {}, { value: 1000 });

		test('1e-3', {}, { value: 0.001 });

		test('1.4e3', {}, { value: 1400 });

	});

});
