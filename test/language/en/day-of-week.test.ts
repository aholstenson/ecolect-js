import { testRunner } from '../helpers';

import { en } from '../../../src/language/en';
import { dayOfWeekGraph } from '../../../src/language/en/dayOfWeekGraph';
import { DayOfWeek } from 'datetime-types';

const test = testRunner(en, dayOfWeekGraph, d => d as DayOfWeek);

describe('English', function() {

	describe('Day of Week', function() {
		test('Friday', {}, DayOfWeek.Friday);

		test('Tue', {}, DayOfWeek.Tuesday);

		test('on Tue', {}, DayOfWeek.Tuesday);
	});

});
