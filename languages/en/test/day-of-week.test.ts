import { DayOfWeek } from 'datetime-types';

import { dayOfWeekGraph } from '../src/dayOfWeekGraph';
import { EnglishLanguage } from '../src/EnglishLanguage';

import { testRunner } from './helpers';

const test = testRunner(new EnglishLanguage(), dayOfWeekGraph, d => d as DayOfWeek);

describe('English', function() {
	describe('Day of Week', function() {
		test('Friday', {}, DayOfWeek.Friday);

		test('Tue', {}, DayOfWeek.Tuesday);

		test('on Tue', {}, DayOfWeek.Tuesday);
	});
});
