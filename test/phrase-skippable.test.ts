import { intentsBuilder } from '../src/index.js';
import { en } from '../src/language/en/index.js';
import { newPhrases } from '../src/resolver/newPhrases.js';

import { assertNotNull } from './assertions.js';

describe('Phrases: Skippable words', function() {
	describe('Matcher', function() {
		const resolver = newPhrases()
			.skippable('please', 'all', 'my')
			.phrase('show orders')
			.toMatcher(en);

		it('Without skippable words', function() {
			return resolver.match('show orders')
				.then(r => expect(r).not.toBeNull());
		});

		it('Leading skippable word', function() {
			return resolver.match('please show orders')
				.then(r => expect(r).not.toBeNull());
		});

		it('Several skippable words', function() {
			return resolver.match('please show all my orders')
				.then(r => expect(r).not.toBeNull());
		});

		it('Trailing skippable word', function() {
			return resolver.match('show orders please')
				.then(r => expect(r).not.toBeNull());
		});

		it('Leading and trailing skippable words', function() {
			return resolver.match('please show all my orders please')
				.then(r => expect(r).not.toBeNull());
		});

		it('Word that is not skippable', function() {
			return resolver.match('show open orders')
				.then(r => expect(r).toBeNull());
		});

		it('Trailing word that is not skippable', function() {
			return resolver.match('show orders now')
				.then(r => expect(r).toBeNull());
		});
	});

	describe('Partial matcher', function() {
		const resolver = newPhrases()
			.skippable('please')
			.phrase('show orders')
			.phrase('show orders for today')
			.toMatcher(en);

		it('Trailing skippable word', function() {
			return resolver.matchPartial('show orders please')
				.then(r => expect(r.length).toEqual(1));
		});

		it('Trailing skippable word being typed', function() {
			return resolver.matchPartial('show orders ple')
				.then(r => expect(r.length).toEqual(0));
		});

		it('Trailing stop word keeps continuations', function() {
			return resolver.matchPartial('show orders for')
				.then(r => expect(r.length).toEqual(1));
		});
	});

	describe('Without skippable words', function() {
		const resolver = newPhrases()
			.phrase('show orders')
			.toMatcher(en);

		it('Leading filler word', function() {
			return resolver.match('please show orders')
				.then(r => expect(r).toBeNull());
		});
	});

	describe('Intents', function() {
		const matcher = intentsBuilder(en)
			.add('orders', newPhrases()
				.skippable('please')
				.phrase('show orders')
				.build()
			)
			.add('customers', newPhrases()
				.phrase('show customers')
				.build()
			)
			.build();

		it('Intent with skippable words', function() {
			return matcher.match('please show orders')
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('orders');
				});
		});

		it('Intent without skippable words', function() {
			return matcher.match('please show customers')
				.then(r => expect(r).toBeNull());
		});
	});
});
