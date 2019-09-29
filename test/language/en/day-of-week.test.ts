import { testRunner } from '../helpers';

import { en } from '../../../src/language/en';
import { dayOfWeekGraph } from '../../../src/language/en/dayOfWeekGraph';
import { Weekday } from '../../../src/time/Weekday';

const test = testRunner(en, dayOfWeekGraph, d => d as Weekday);

describe('English', function() {

	describe('Day of Week', function() {
		test('Friday', {}, Weekday.Friday);

		test('Tue', {}, Weekday.Tuesday);

		test('on Tue', {}, Weekday.Tuesday);
	});

});
