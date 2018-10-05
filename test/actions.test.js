'use strict';

const chai = require('chai');
const expect = chai.expect;

const ecolect = require('../');
const en = require('../language/en');

describe('Actions', function() {
	describe('Orders', function() {
		const actions = ecolect.actions(en)
			.action('orders')
				.add('Orders')
				.add('Show orders')
				.handler(() => 'executed orders')
				.done()
			.action()
				.add('Orders that are active')
				.add('Show orders that are active')
				.handler((match, value) => 'active ' + value)
				.done()
			.build();

		it('Language available', () => {
			expect(actions.language).to.equal(en);
		});

		it('Match: orders', function() {
			return actions.match('orders')
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.intent).to.equal('orders');
				});
		});

		it('No match: show', function() {
			return actions.match('show')
				.then(results => {
					expect(results.matches.length).to.equal(0);
				});
		});

		it('Partial: orders', function() {
			return actions.match('orders', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(2);
				});
		});

		it('Partial: or', function() {
			return actions.match('or', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(2);
				});
		});

		it('Matched items have an activate() function', () => {
			return actions.match('orders')
				.then(results => {
					expect(results.best.activate).to.be.a('function');
					expect(results.matches[0].activate).to.be.a('function');
				});
		});

		it('activate() functions is callable', () => {
			return actions.match('orders')
				.then(results => {
					const p = results.best.activate();
					expect(p.then).to.be.a('function');
					return p;
				})
				.then(v => expect(v).to.equal('executed orders'));
		});

		it('activate() passes arguments to handler', () => {
			return actions.match('orders that are active')
				.then(results => {
					const p = results.best.activate('1234');
					expect(p.then).to.be.a('function');
					return p;
				})
				.then(v => expect(v).to.equal('active 1234'));
		});

		it('handle() calls activate()', () => {
			return actions.handle('orders')
				.then(v => {
					expect(v.intent).to.equal('orders');
					expect(v.result).to.equal('executed orders');
				});
		});

		it('handle() works if nothing matches', () => {
			return actions.handle('show')
				.then(v => {
					expect(v.intent).to.equal(null);
				});
		});

		it('handle() passes options.arguments to handler', () => {
			return actions.handle('orders that are active', { arguments: [ 'cookie' ] })
				.then(v => {
					expect(v.result).to.equal('active cookie');
				});
		});
	});
});
