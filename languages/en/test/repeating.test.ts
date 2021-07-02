import { GraphBuilder } from '@ecolect/graph';

import { testRunnerViaGraph } from './helpers';
import { EnglishLanguage } from '../src/EnglishLanguage';

const en = new EnglishLanguage();

const phrase = new GraphBuilder<number>(en)
	.name('phrase')

	.allowPartial()

	.add('Hello', () => 1)
	.add('World', () => 2)

	.build();

const test = testRunnerViaGraph(en, en.repeating(phrase).build(), r => r);

describe('English', function() {
	describe('Repeating', function() {
		test('Hello', {}, [ 1 ]);

		test('World', {}, [ 2 ]);

		test('Hello and World', {}, [ 1, 2 ]);

		test('Hello World', {}, [ 1, 2 ]);

		test('World, Hello', {}, [ 2, 1 ]);

		test('Hello and World Hello', {}, [ 1, 2, 1 ]);

		test('Hel', { partial: false }, null);

		test('Hel', { partial: true }, [ 1 ]);

		test('Hello Wo', { partial: true }, [ 1, 2 ]);

		test('Hello and Wo', { partial: true }, [ 1, 2 ]);

		test('He and Wo', { partial: true }, null);
	});
});
