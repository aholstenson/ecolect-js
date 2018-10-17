import en from '../../../src/language/en';
import { testRunner } from '../helpers';

const test = testRunner(en.temperature);


describe('English', function() {

	describe('Temperature', function() {

		test('one', {}, { value: 1, unit: 'unknown' });

		test('one degree', {}, { value: 1, unit: 'unknown' });

		test('one degree', { temperature: 'celsius' }, { value: 1, unit: 'celsius' });

		test('40 F', {}, { value: 40, unit: 'fahrenheit' });

		test('40 fahrenheit', {}, { value: 40, unit: 'fahrenheit' });

		test('40 C', {}, { value: 40, unit: 'celsius' });

		test('40 celsius', {}, { value: 40, unit: 'celsius' });

	});

});
