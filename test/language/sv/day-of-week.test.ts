import { DayOfWeek } from 'datetime-types';

import { dayOfWeekGraph } from '../../../src/language/sv/dayOfWeekGraph.js';
import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), dayOfWeekGraph, d => d);

describe('Swedish', function() {
	describe('Day of Week', function() {
		test('fredag', {}, DayOfWeek.Friday);

		test('tis', {}, DayOfWeek.Tuesday);

		test('på tisdag', {}, DayOfWeek.Tuesday);

		test('lördag', {}, DayOfWeek.Saturday);

		test('söndag', {}, DayOfWeek.Sunday);

		// The genitive form is used when talking about a day that has passed
		test('måndags', {}, DayOfWeek.Monday);
	});
});
