import { en } from '@ecolect/language-en';

import { intentsBuilder } from '../src/index.js';
import { expandPhrase } from '../src/resolver/expandPhrase.js';
import { newPhrases } from '../src/resolver/newPhrases.js';
import { anyTextValue, dateIntervalValue } from '../src/values/index.js';

import { assertNotNull } from './assertions.js';

describe('Phrases: Groups of alternatives', function() {
	describe('expandPhrase', function() {
		it('Phrase without groups', function() {
			expect(expandPhrase('show orders')).toEqual([ 'show orders' ]);
		});

		it('Group that must match', function() {
			expect(expandPhrase('orders (from|in) {when}')).toEqual([
				'orders from {when}',
				'orders in {when}'
			]);
		});

		it('Group that may be left out', function() {
			expect(expandPhrase('[show|list] orders')).toEqual([
				'show orders',
				'list orders',
				'orders'
			]);
		});

		it('Several groups', function() {
			expect(expandPhrase('[show|list] orders (from|in) {when}')).toEqual([
				'show orders from {when}',
				'show orders in {when}',
				'list orders from {when}',
				'list orders in {when}',
				'orders from {when}',
				'orders in {when}'
			]);
		});

		it('Group within a word', function() {
			expect(expandPhrase('order[s]')).toEqual([ 'orders', 'order' ]);
		});

		it('Alternative with several words', function() {
			expect(expandPhrase('orders (for|belonging to) {customer}')).toEqual([
				'orders for {customer}',
				'orders belonging to {customer}'
			]);
		});

		it('Alternative that is a value', function() {
			expect(expandPhrase('orders (today|{when})')).toEqual([
				'orders today',
				'orders {when}'
			]);
		});

		it('Alternatives that are the same are expanded once', function() {
			expect(expandPhrase('[show|show] orders')).toEqual([
				'show orders',
				'orders'
			]);
		});

		it('Group at the end that may be left out', function() {
			expect(expandPhrase('show orders [now]')).toEqual([
				'show orders now',
				'show orders'
			]);
		});

		it('Group that is never closed', function() {
			expect(() => expandPhrase('[show orders')).toThrow();
		});

		it('Closing character without a group', function() {
			expect(() => expandPhrase('show orders)')).toThrow();
		});

		it('Nested groups', function() {
			expect(() => expandPhrase('([show|list]) orders')).toThrow();
		});

		it('Phrase without anything to match', function() {
			expect(() => expandPhrase('[]')).toThrow();
		});
	});

	describe('Matcher', function() {
		const matcher = newPhrases()
			.value('when', dateIntervalValue())
			.phrase('[show|list] orders (from|in) {when}')
			.toMatcher(en);

		const options = { now: new Date(2020, 0, 1) };

		it('First alternative of both groups', function() {
			return matcher.match('show orders from today', options)
				.then(r => assertNotNull(r));
		});

		it('Second alternative of both groups', function() {
			return matcher.match('list orders in today', options)
				.then(r => assertNotNull(r));
		});

		it('Group that may be left out is left out', function() {
			return matcher.match('orders from today', options)
				.then(r => assertNotNull(r));
		});

		it('Word that is not an alternative', function() {
			return matcher.match('display orders from today', options)
				.then(r => expect(r).toBeNull());
		});

		it('Value is captured', function() {
			return matcher.match('list orders in 2020', options)
				.then(r => {
					assertNotNull(r);
					expect(r.values.when).not.toBeUndefined();
				});
		});
	});

	describe('Group that must match', function() {
		const matcher = newPhrases()
			.phrase('orders (open|closed)')
			.toMatcher(en);

		it('Alternative is given', function() {
			return matcher.match('orders closed')
				.then(r => assertNotNull(r));
		});

		it('Group is left out', function() {
			return matcher.match('orders')
				.then(r => expect(r).toBeNull());
		});
	});

	describe('Matching everything', function() {
		it('Alternatives that resolve the same values are reported once', function() {
			const matcher = newPhrases()
				.value('customer', anyTextValue())
				.phrase('[show|list] orders for {customer}')
				.toMatcher(en);

			return matcher.matchAll('orders for Test')
				.then(r => {
					expect(r.length).toEqual(1);
					expect(r[0].values).toEqual({ customer: 'Test' });
				});
		});
	});

	describe('Intents', function() {
		const matcher = intentsBuilder(en)
			.add('orders', newPhrases()
				.phrase('[show|list] orders')
				.build()
			)
			.build();

		it('Intent matches an alternative', function() {
			return matcher.match('list orders')
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('orders');
				});
		});

		it('Intent matches without the group', function() {
			return matcher.match('orders')
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('orders');
				});
		});
	});
});
