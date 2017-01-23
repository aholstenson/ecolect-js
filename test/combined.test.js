'use strict';

const chai = require('chai');
const expect = chai.expect;

const ecolect = require('../');
const en = require('../language/en');
const any = require('../values/any');

describe('Combined Intents', function() {
	describe('Orders', function() {
		const intents = ecolect.intents(en)
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
				});
		});

		it('Partial: orders for Test', function() {
			return intents.match('orders for Test', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(1);
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
	})
});
