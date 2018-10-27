import { expect } from 'chai';

const { intentsBuilder } = require('../src');
import en from '../src/language/en';
import { any } from '../src/values';

describe('Intents', function() {
	describe('Basic', function() {
		it('Throws error when no language', () => {
			expect(() => {
				intentsBuilder();
			}).to.throw();
		});

		it('Throws error when no intent id', () => {
			expect(() => {
				intentsBuilder(en)
					.intent();
			}).to.throw();
		});
	});

	describe('Orders', function() {
		const intents = intentsBuilder(en)
			.intent('orders')
				.add('Orders')
				.add('Show orders')
				.done()
			.intent('orders:active')
				.add('Orders that are active')
				.add('Show orders that are active')
				.done()
			.intent('customer:orders')
				.value('customer', any())
				.add('Orders for {customer}')
				.add('Find orders for {customer}')
				.add('Show orders for {customer}')
				.done()
			.intent('employee:assignments')
				.value('employee', any())
				.add('Assignments for {employee}')
				.done()
			.build();

		it('Match: orders', function() {
			return intents.match('orders')
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.intent).to.equal('orders');
				});
		});

		it('No match: show', function() {
			return intents.match('show')
				.then(results => {
					expect(results.matches.length).to.equal(0);
				});
		});

		it('Partial: orders', function() {
			return intents.match('orders', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(3);
				});
		});

		it('Partial: or', function() {
			return intents.match('or', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(3);
				});
		});

		it('Partial: show orders', function() {
			return intents.match('show orders', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(3);
				});
		});

		it('Partial: sh order', function() {
			return intents.match('sh order', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(0);
				});
		});

		it('Partial: orders for', function() {
			return intents.match('orders for', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.intent).to.equal('customer:orders');
				});
		});

		it('Partial: orders for Test', function() {
			return intents.match('orders for Test', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.intent).to.equal('customer:orders');
					expect(results.best.values.customer).to.equal('Test');
				});
		});

		it('Partial (with skippable): orders Test', function() {
			return intents.match('orders Test', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.intent).to.equal('customer:orders');
					expect(results.best.values.customer).to.equal('Test');
				});
		});

		it('Partial and fuzzy: orders for Test', function() {
			return intents.match('o Test', { partial: true, fuzzy: true })
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.intent).to.equal('customer:orders');
					expect(results.best.values.customer).to.equal('Test');
				});
		});

		it('Partial: assign', function() {
			return intents.match('assign', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(1);
				});
		});

		it('Partial: assignments', function() {
			return intents.match('assignments', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(1);
				});
		});
	});
});
