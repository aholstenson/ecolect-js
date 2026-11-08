import { DayOfWeek } from 'datetime-types';

import { dayOfWeekGraph } from '../../../src/language/en/dayOfWeekGraph.js';
import { EnglishLanguage } from '../../../src/language/en/EnglishLanguage.js';

import { testRunner } from './helpers.js';

const test = testRunner(new EnglishLanguage(), dayOfWeekGraph, d => d as DayOfWeek);

describe('English', function() {
	describe('Day of Week', function() {
		test('Friday', {}, DayOfWeek.FRIDAY);

		test('Tue', {}, DayOfWeek.TUESDAY);

		test('on Tue', {}, DayOfWeek.TUESDAY);
	});
});
