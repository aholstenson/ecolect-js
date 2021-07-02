import { en } from '@ecolect/language-en';

import { actionsBuilder, newPhrases } from '../src';

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
					expect(r).not.toBeNull();
					expect(r.id).toEqual('orders');
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

		it('Partial: or', function() {
			return actions.matchPartial('or')
				.then(r => {
					expect(r.length).toEqual(2);
				});
		});

		it('Matched items have an activate() function', () => {
			return actions.match('orders')
				.then(r => {
					expect(typeof r.activate).toEqual('function');
				});
		});

		it('activate() functions is callable', () => {
			return actions.match('orders')
				.then(r => {
					const p = r.activate(1234);
					expect(p).toEqual('executed orders');
				});
		});

		it('activate() passes context to handler', () => {
			return actions.match('orders that are active')
				.then(r => {
					const p = r.activate(1234);
					expect(p).toEqual('active 1234');
				});
		});
	});
});
