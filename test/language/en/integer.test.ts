import { en } from '../../../src/language/en';
import { testRunner } from '../helpers';

const test = testRunner(en, 'integer');

describe('English', function() {

	describe('Integer', function() {
		test('one', {}, { value: 1 });

		test('1', {}, { value: 1 });

		test('1 4', {}, { value: 14 });

		test('thousand', {}, { value: 1000 });

		test('one thousand', {}, { value: 1000 });

		test('1 thousand', {}, { value: 1000 });

		test('1 400', {}, { value: 1400 });

		test('two dozen', {}, { value: 24 });

		test('100k', {}, { value: 100000 });

		test('-100', {}, null);

		test('-1 000', {}, null);

		test('minus one million', {}, null);

		test('1 thousand thousand', {}, { value: 1000000 });

		test('one 000', {}, null);

		test('10,000', {}, { value: 10000 });
	});
});
