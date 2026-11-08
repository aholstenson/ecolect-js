import { BigInteger } from 'numeric-types/integer';

import { actionsBuilder, newPhrases } from '../src/index.js';
import { en } from '../src/language/en/index.js';
import { customValue, integerValue } from '../src/values/index.js';


import { assertNotNull } from './assertions.js';

describe('Actions', function() {
	describe('Orders', function() {
		const actions = actionsBuilder<number, string>(en)
			.add({
				id: 'orders',
				phrases: newPhrases()
					.phrase('Orders')
					.phrase('Show orders')
					.build(),
				handler: () => 'executed orders'
			})
			.add({
				id: 'activeOrders',
				phrases: newPhrases()
					.phrase('Orders that are active')
					.phrase('Show orders that are active')
					.build(),

				handler: (match, ctx) => 'active ' + ctx
			})
			.build();

		it('Match: orders', function() {
			return actions.match('orders')
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('orders');
				});
		});

		it('Match: score of orders is above zero', function() {
			return actions.match('orders')
				.then(r => {
					assertNotNull(r);
					expect(r.score).toBeGreaterThan(0);
				});
		});

		it('No match: show', function() {
			return actions.match('show')
				.then(r => {
					expect(r).toBeNull();
				});
		});

		it('Partial: orders', function() {
			return actions.matchPartial('orders')
				.then(r => {
					expect(r.length).toEqual(2);
				});
		});

		it('Partial: empty expression lists each action once', function() {
			return actions.matchPartial('')
				.then(r => {
					expect(r.map(a => a.id).sort()).toEqual([ 'activeOrders', 'orders' ]);
				});
		});

		it('Partial: or', function() {
			return actions.matchPartial('or')
				.then(r => {
					expect(r.length).toEqual(2);
				});
		});

		it('Match all: orders', function() {
			return actions.matchAll('orders')
				.then(r => {
					expect(r.map(a => a.id)).toEqual([ 'orders' ]);
				});
		});

		it('Match all: an action matched by several phrases is returned once', function() {
			return actions.matchAll('show orders')
				.then(r => {
					expect(r.map(a => a.id)).toEqual([ 'orders' ]);
				});
		});

		it('Match all: matched items have an activate() function', function() {
			return actions.matchAll('orders that are active')
				.then(r => {
					expect(r.length).toEqual(1);
					expect(r[0].activate(1234)).toEqual('active 1234');
				});
		});

		it('No match all: show', function() {
			return actions.matchAll('show')
				.then(r => {
					expect(r).toEqual([]);
				});
		});

		it('Matched items have an activate() function', () => {
			return actions.match('orders')
				.then(r => {
					assertNotNull(r);
					expect(typeof r.activate).toEqual('function');
				});
		});

		it('activate() functions is callable', () => {
			return actions.match('orders')
				.then(r => {
					assertNotNull(r);

					const p = r.activate(1234);
					expect(p).toEqual('executed orders');
				});
		});

		it('activate() passes context to handler', () => {
			return actions.match('orders that are active')
				.then(r => {
					assertNotNull(r);

					const p = r.activate(1234);
					expect(p).toEqual('active 1234');
				});
		});
	});

	describe('Parsed value before a custom value', function() {
		const actions = actionsBuilder<void, Record<string, unknown>>(en)
			.add({
				id: 'set',
				phrases: newPhrases()
					.value('n', integerValue())
					.value('c', customValue<string>(encounter => {
						if(encounter.text === 'red') {
							encounter.match('RED');
						}
					}))
					.phrase('set {n} to {c}')
					.build(),
				handler: match => match.values
			})
			.build();

		it('activate() passes both values to the handler', function() {
			return actions.match('set 5 to red')
				.then(r => {
					assertNotNull(r);
					expect(r.activate()).toEqual({ n: BigInteger.fromNumber(5), c: 'RED' });
				});
		});
	});
});
