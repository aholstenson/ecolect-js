import { GraphBuilder } from '../../../src/graph/index.js';
import { SwedishLanguage } from '../../../src/language/sv/SwedishLanguage.js';
import { testRunnerViaGraph } from '../helpers.js';

const sv = new SwedishLanguage();

const phrase = new GraphBuilder<number>(sv)
	.name('phrase')

	.allowPartial()

	.add('Hej', () => 1)
	.add('Världen', () => 2)

	.build();

const test = testRunnerViaGraph(sv, sv.repeating(phrase).build(), r => r);

describe('Swedish', function() {
	describe('Repeating', function() {
		test('Hej', {}, [ 1 ]);

		test('Världen', {}, [ 2 ]);

		test('Hej och Världen', {}, [ 1, 2 ]);

		test('Hej Världen', {}, [ 1, 2 ]);

		test('Världen, Hej', {}, [ 2, 1 ]);

		test('Hej och Världen Hej', {}, [ 1, 2, 1 ]);

		// The plain form shares a stem with the definite one in the phrase
		test('Värld', { partial: false }, [ 2 ]);

		test('Vä', { partial: false }, null);

		test('Vä', { partial: true }, [ 2 ]);

		test('Hej Värl', { partial: true }, [ 1, 2 ]);
	});
});
