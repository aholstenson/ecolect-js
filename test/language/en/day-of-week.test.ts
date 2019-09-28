import { en } from '../../../src/language/en';
import { testRunner } from '../helpers';
import { Weekday } from '../../../src/time/weekday';

const test = testRunner(en, 'day-of-week');

describe('English', function() {

	describe('Day of Week', function() {
		test('Friday', {}, Weekday.Friday);

		test('Tue', {}, Weekday.Tuesday);

		test('on Tue', {}, Weekday.Tuesday);
	});

});
