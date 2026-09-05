import { dateTimeDurationGraph } from '../../../src/language/sv/dateTimeDurationGraph.js';
import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { mapDuration } from '../../../src/type-datetime/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), dateTimeDurationGraph, mapDuration);

describe('Swedish', function() {
	describe('Date & Time Duration', function() {
		test('1 timme', {}, { hours: 1 });

		test('4 dagar', {}, { days: 4 });

		test('4 dagar och 10 minuter', {}, { days: 4, minutes: 10 });

		test('4 dagar 10 minuter', {}, { days: 4, minutes: 10 });

		test('4 veckor och 10 minuter', {}, { weeks: 4, minutes: 10 });

		test('2 d 20 min', {}, { days: 2, minutes: 20 });
	});
});
