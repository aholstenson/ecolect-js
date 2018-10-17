import en from '../../../src/language/en';
import { testRunner } from '../helpers';

const test = testRunner(en.dayOfWeek);

describe('English', function() {

	describe('Day of Week', function() {
		test('Friday', {}, { value: 5 });

		test('Tue', {}, { value: 2 });

		test('on Tue', {}, { value: 2 });
	});

});
