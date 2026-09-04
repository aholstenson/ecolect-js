import { mapDuration } from '@ecolect/type-datetime';

import { dateTimeDurationGraph } from '../src/dateTimeDurationGraph.js';
import { EnglishLanguage } from '../src/EnglishLanguage.js';

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
