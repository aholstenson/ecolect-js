'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../../../language/en');
const month = (text, options) => en.month.match(text, options);

describe('English', function() {


	describe('Month', function() {
		it('jan', function() {
			return month('jan')
				.then(v =>
					expect(v).to.deep.equal({ month: 0 })
				);
		});

		it('this month', function() {
			const now = new Date(2010, 0, 1);
			return month('this month', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						year: 2010,
						month: 0
					})
				);
		});

		it('next month', function() {
			const now = new Date(2010, 0, 1);
			return month('next month', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						year: 2010,
						month: 1
					})
				);
		});

		it('last month', function() {
			const now = new Date(2010, 0, 1);
			return month('last month', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						year: 2009,
						month: 11
					})
				);
		});

		it('in one month', function() {
			const now = new Date(2010, 0, 1);
			return month('in one month', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						year: 2010,
						month: 1
					})
				);
		});

		it('in 4 months', function() {
			const now = new Date(2010, 0, 1);
			return month('in 4 months', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						year: 2010,
						month: 4
					})
				);
		});
	});

});
