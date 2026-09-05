
import { dateTimeDurationGraph } from '../../../src/language/en/dateTimeDurationGraph.js';
import { EnglishLanguage } from '../../../src/language/en/EnglishLanguage.js';
import { mapDuration } from '../../../src/type-datetime/index.js';

import { testRunner } from './helpers.js';

const test = testRunner(new EnglishLanguage(), dateTimeDurationGraph, mapDuration);

describe('English', function() {

	describe('Date & Time Duration', function() {

		test('1 hour', {}, {
			hours: 1
		});

		test('4 days', {}, {
			days: 4
		});

		test('4 days and 10 minutes', {}, {
			days: 4,
			minutes: 10
		});

		test('4 days 10 minutes', {}, {
			days: 4,
			minutes: 10
		});

	});

});
