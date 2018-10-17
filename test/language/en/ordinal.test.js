import en from '../../../src/language/en';
import { testRunner } from '../helpers';

const test = testRunner(en.ordinal);

describe('English', function() {

	describe('Ordinal', function() {
		test('1', {}, { value: 1 });

		test('1st', {}, { value: 1 });

		test('2 1st', {}, { value: 21 });

		test('stuff st', {}, null);
	});

});
