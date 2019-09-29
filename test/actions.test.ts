import { en } from '../src/language/en';
import { actionsBuilder } from '../src';

describe('Actions', function() {
	describe('Orders', function() {
		const actions = actionsBuilder<number, string>(en)
			.action('orders')
				.add('Orders')
				.add('Show orders')
				.handler(() => 'executed orders')
				.done()
			.action()
				.add('Orders that are active')
				.add('Show orders that are active')
				.handler((match, ctx) => 'active ' + ctx)
				.done()
			.build();

		it('Language available', () => {
			expect(actions.language).toEqual(en);
		});

		it('Match: orders', function() {
			return actions.match('orders')
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.intent).toEqual('orders');
				});
		});

		it('No match: show', function() {
			return actions.match('show')
				.then(results => {
					expect(results.matches.length).toEqual(0);
				});
		});

		it('Partial: orders', function() {
			return actions.match('orders', { partial: true })
				.then(results => {
					expect(results.matches.length).toEqual(2);
				});
		});

		it('Partial: or', function() {
			return actions.match('or', { partial: true })
				.then(results => {
					expect(results.matches.length).toEqual(2);
				});
		});

		it('Matched items have an activate() function', () => {
			return actions.match('orders')
				.then(results => {
					expect(typeof results.best.activate).toEqual('function')
					expect(typeof results.matches[0].activate).toEqual('function');
				});
		});

		it('activate() functions is callable', () => {
			return actions.match('orders')
				.then(results => {
					const p = results.best.activate(1234);
					expect(typeof p.then).toEqual('function');
					return p;
				})
				.then(v => expect(v).toEqual('executed orders'));
		});

		it('activate() passes context to handler', () => {
			return actions.match('orders that are active')
				.then(results => {
					const p = results.best.activate(1234);
					expect(typeof p.then).toEqual('function');
					return p;
				})
				.then(v => expect(v).toEqual('active 1234'));
		});
	});
});
