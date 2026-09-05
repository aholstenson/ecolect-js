import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { timeDurationGraph } from '../../../src/language/sv/timeDurationGraph.js';
import { mapDuration } from '../../../src/type-datetime/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), timeDurationGraph, mapDuration);

describe('Swedish', function() {
	describe('Time Duration', function() {
		test('2 timmar', {}, { hours: 2 });

		test('en timme', {}, { hours: 1 });

		test('1 s', {}, { seconds: 1 });

		test('2 h 45 min', {}, { hours: 2, minutes: 45 });

		test('4 minuter och 10 sekunder', {}, { minutes: 4, seconds: 10 });

		test('500 ms', {}, { milliseconds: 500 });
	});
});
