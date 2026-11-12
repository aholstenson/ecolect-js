import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { timeGraph } from '../../../src/language/sv/timeGraph.js';
import { mapTime } from '../../../src/type-datetime/index.js';
import { testRunner } from '../helpers.js';

const test = testRunner(new SwedishLanguage(), timeGraph, mapTime);

const morning = { now: new Date(2010, 0, 1, 10, 0) };

describe('Swedish', function() {
	describe('Time', function() {
		test('00:00', morning, {
			hour: 0,
			minute: 0,
			second: 0,
			millisecond: 0
		});

		// Swedish writes the clock with a period as often as with a colon
		test('14.30', morning, {
			hour: 14,
			minute: 30,
			second: 0,
			millisecond: 0
		});

		test('kl 15', morning, {
			hour: 15,
			minute: 0,
			second: 0,
			millisecond: 0
		});

		test('klockan 15:30', morning, {
			hour: 15,
			minute: 30,
			second: 0,
			millisecond: 0
		});

		test('midnatt', morning, {
			hour: 0,
			minute: 0,
			second: 0,
			millisecond: 0
		});

		test('middag', morning, {
			hour: 12,
			minute: 0,
			second: 0,
			millisecond: 0
		});

		/*
		 * `halv tolv` is half an hour before twelve, where the English
		 * `half twelve` is half an hour after it.
		 */
		test('halv tolv', morning, {
			hour: 11,
			minute: 30,
			second: 0,
			millisecond: 0
		});

		test('kvart i tolv', morning, {
			hour: 11,
			minute: 45,
			second: 0,
			millisecond: 0
		});

		test('kvart över tolv', morning, {
			hour: 12,
			minute: 15,
			second: 0,
			millisecond: 0
		});

		test('fem i tolv', morning, {
			hour: 11,
			minute: 55,
			second: 0,
			millisecond: 0
		});

		test('3 em', morning, {
			hour: 15,
			minute: 0,
			second: 0,
			millisecond: 0
		});

		test('9 fm', morning, {
			hour: 9,
			minute: 0,
			second: 0,
			millisecond: 0
		});

		test('om 2 timmar', morning, {
			hour: 12,
			minute: 0,
			second: 0,
			millisecond: 0
		});

		test('2 timmar sedan', morning, {
			hour: 8,
			minute: 0,
			second: 0,
			millisecond: 0
		});

		test('för 2 timmar sedan', morning, {
			hour: 8,
			minute: 0,
			second: 0,
			millisecond: 0
		});

		describe('Parts of the day', function() {
			test('morgon', morning, {
				hour: 9,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('på morgonen', morning, {
				hour: 9,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('i morse', morning, {
				hour: 9,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('förmiddag', morning, {
				hour: 9,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('lunch', morning, {
				hour: 12,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('vid lunch', morning, {
				hour: 12,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('efter lunch', morning, {
				hour: 13,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('före lunch', morning, {
				hour: 11,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('eftermiddag', morning, {
				hour: 15,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('i eftermiddag', morning, {
				hour: 15,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('kväll', morning, {
				hour: 19,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('ikväll', morning, {
				hour: 19,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('i kväll', morning, {
				hour: 19,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('natt', morning, {
				hour: 22,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('inatt', morning, {
				hour: 22,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('i natt', morning, {
				hour: 22,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('början av dagen', morning, {
				hour: 9,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('slutet av dagen', morning, {
				hour: 17,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('dagens slut', morning, {
				hour: 17,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('arbetsdagens slut', morning, {
				hour: 17,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			// An hour next to a part of the day is in that part
			test('9 på morgonen', morning, {
				hour: 9,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('9 på kvällen', morning, {
				hour: 21,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('2 på natten', morning, {
				hour: 2,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('ikväll kl 8', morning, {
				hour: 20,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('halv åtta ikväll', morning, {
				hour: 19,
				minute: 30,
				second: 0,
				millisecond: 0
			});

			// The hours come from the dayParts option
			test('morgon', { ...morning, dayParts: { morning: 7 } }, {
				hour: 7,
				minute: 0,
				second: 0,
				millisecond: 0
			});

			test('slutet av dagen', { ...morning, dayParts: { endOfDay: 18 } }, {
				hour: 18,
				minute: 0,
				second: 0,
				millisecond: 0
			});
		});
	});
});
