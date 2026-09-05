import { en } from '@ecolect/language-en';

import { IntentsBuilder } from '../src/IntentsBuilder.js';
import { newPhrases } from '../src/resolver/newPhrases.js';

import { assertNotNull } from './assertions.js';
import { anyTextValue } from '../src/values/index.js';

describe('Intents', function() {
	describe('Orders', function() {
		const intents = new IntentsBuilder(en)
			.add('orders', newPhrases()
				.phrase('Orders')
				.phrase('Show orders')
				.build()
			)
			.add('orders:active', newPhrases()
				.phrase('Orders that are active')
				.phrase('Show orders that are active')
				.build()
			)
			.add('customer:orders', newPhrases()
				.value('customer', anyTextValue())
				.phrase('Orders for {customer}')
				.phrase('Find orders for {customer}')
				.phrase('Show orders for {customer}')
				.build()
			)
			.add('employee:assignments', newPhrases()
				.value('employee', anyTextValue())
				.phrase('Assignments for {employee}')
				.build()
			)
			.build();

		it('Match: orders', function() {
			return intents.match('orders')
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('orders');
				});
		});

		it('Match: score of orders is above zero', function() {
			return intents.match('orders')
				.then(r => {
					assertNotNull(r);
					expect(r.score).toBeGreaterThan(0);
				});
		});

		it('Partial: scores are above zero and in descending order', function() {
			return intents.matchPartial('orders')
				.then(r => {
					const scores = r.map(m => m.score);

					expect(scores.length).toBeGreaterThan(1);
					expect(scores.every(score => score > 0)).toBe(true);
					expect([ ...scores ].sort((a, b) => b - a)).toEqual(scores);
				});
		});

		it('Match (skippable in input): show for orders', function() {
			return intents.match('show for orders', { fuzzy: true })
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('orders');
				});
		});

		it('Match (skippable in expression): orders Test', function() {
			// Test that skipping `for` works fine
			return intents.match('orders Test')
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('customer:orders');
				});
		});

		it('No match: show', function() {
			return intents.match('show')
				.then(r => {
					expect(r).toBeNull();
				});
		});

		it('Partial: orders', function() {
			return intents.matchPartial('orders')
				.then(r => {
					expect(r.length).toEqual(3);
				});
		});

		it('Partial: or', function() {
			return intents.matchPartial('or')
				.then(r => {
					expect(r.length).toEqual(3);
				});
		});

		it('Partial: show orders', function() {
			return intents.matchPartial('show orders')
				.then(r => {
					expect(r.length).toEqual(3);
				});
		});

		it('Partial: sh order', function() {
			return intents.matchPartial('sh order')
				.then(r => {
					expect(r.length).toEqual(0);
				});
		});

		it('Partial: orders for', function() {
			return intents.matchPartial('orders for')
				.then(r => {
					expect(r.length).toEqual(1);
					expect(r[0].id).toEqual('customer:orders');
				});
		});

		it('Partial: orders for Test', function() {
			return intents.matchPartial('orders for Test')
				.then(r => {
					expect(r.length).toEqual(1);
					expect(r[0].id).toEqual('customer:orders');

					if(r[0].id === 'customer:orders') {
						expect(r[0].values.customer).toEqual('Test');
					}
				});
		});

		it('Partial (with skippable): orders Test', function() {
			return intents.matchPartial('orders Test')
				.then(r => {
					expect(r.length).toEqual(1);
					expect(r[0].id).toEqual('customer:orders');

					if(r[0].id === 'customer:orders') {
						expect(r[0].values.customer).toEqual('Test');
					}
				});
		});

		it('Partial and fuzzy: orders for Test', function() {
			return intents.matchPartial('o Test', { fuzzy: true })
				.then(r => {
					expect(r.length).toEqual(1);
					expect(r[0].id).toEqual('customer:orders');

					if(r[0].id === 'customer:orders') {
						expect(r[0].values.customer).toEqual('Test');
					}
				});
		});

		it('Partial: assign', function() {
			return intents.matchPartial('assign')
				.then(r => {
					expect(r.length).toEqual(1);
				});
		});

		it('Partial: assignments', function() {
			return intents.matchPartial('assignments')
				.then(r => {
					expect(r.length).toEqual(1);
				});
		});
	});
});
