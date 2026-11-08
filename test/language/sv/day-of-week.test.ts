import { DayOfWeek } from 'datetime-types';

import { dayOfWeekGraph } from '../../../src/language/sv/dayOfWeekGraph.js';
import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), dayOfWeekGraph, d => d);

describe('Swedish', function() {
	describe('Day of Week', function() {
		test('fredag', {}, DayOfWeek.FRIDAY);

		test('tis', {}, DayOfWeek.TUESDAY);

		test('på tisdag', {}, DayOfWeek.TUESDAY);

		test('lördag', {}, DayOfWeek.SATURDAY);

		test('söndag', {}, DayOfWeek.SUNDAY);

		// The genitive form is used when talking about a day that has passed
		test('måndags', {}, DayOfWeek.MONDAY);
	});
});
