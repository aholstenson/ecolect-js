'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../../../language/en');
const month = (text, options) => en.month.match(text, options);

describe('English', function() {


	describe('Month', function() {
		it('jan', function() {
			const now = new Date(2010, 0, 1);
			return month('jan', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 0,
						day: 1
					})
				);
		});

		it('january', function() {
			const now = new Date(2010, 0, 1);
			return month('january', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 0,
						day: 1
					})
				);
		});

		it('feb', function() {
			const now = new Date(2010, 0, 1);
			return month('feb', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 1,
						day: 1
					})
				);
		});

		it('february', function() {
			const now = new Date(2010, 0, 1);
			return month('february', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 1,
						day: 1
					})
				);
		});

		it('mar', function() {
			const now = new Date(2010, 0, 1);
			return month('mar', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 2,
						day: 1
					})
				);
		});

		it('march', function() {
			const now = new Date(2010, 0, 1);
			return month('march', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 2,
						day: 1
					})
				);
		});

		it('apr', function() {
			const now = new Date(2010, 0, 1);
			return month('apr', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 3,
						day: 1
					})
				);
		});

		it('april', function() {
			const now = new Date(2010, 0, 1);
			return month('april', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 3,
						day: 1
					})
				);
		});

		it('may', function() {
			const now = new Date(2010, 0, 1);
			return month('may', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 4,
						day: 1
					})
				);
		});

		it('jun', function() {
			const now = new Date(2010, 0, 1);
			return month('jun', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 5,
						day: 1
					})
				);
		});

		it('june', function() {
			const now = new Date(2010, 0, 1);
			return month('june', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 5,
						day: 1
					})
				);
		});

		it('jul', function() {
			const now = new Date(2010, 0, 1);
			return month('jul', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 6,
						day: 1
					})
				);
		});

		it('july', function() {
			const now = new Date(2010, 0, 1);
			return month('july', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 6,
						day: 1
					})
				);
		});

		it('aug', function() {
			const now = new Date(2010, 0, 1);
			return month('aug', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 7,
						day: 1
					})
				);
		});

		it('august', function() {
			const now = new Date(2010, 0, 1);
			return month('august', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 7,
						day: 1
					})
				);
		});

		it('sep', function() {
			const now = new Date(2010, 0, 1);
			return month('sep', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 8,
						day: 1
					})
				);
		});

		it('sept', function() {
			const now = new Date(2010, 0, 1);
			return month('sept', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 8,
						day: 1
					})
				);
		});

		it('september', function() {
			const now = new Date(2010, 0, 1);
			return month('september', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 8,
						day: 1
					})
				);
		});

		it('oct', function() {
			const now = new Date(2010, 0, 1);
			return month('oct', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 9,
						day: 1
					})
				);
		});

		it('october', function() {
			const now = new Date(2010, 0, 1);
			return month('october', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 9,
						day: 1
					})
				);
		});

		it('nov', function() {
			const now = new Date(2010, 0, 1);
			return month('nov', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 10,
						day: 1
					})
				);
		});

		it('november', function() {
			const now = new Date(2010, 0, 1);
			return month('november', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 10,
						day: 1
					})
				);
		});

		it('dec', function() {
			const now = new Date(2010, 0, 1);
			return month('dec', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 11,
						day: 1
					})
				);
		});

		it('december', function() {
			const now = new Date(2010, 0, 1);
			return month('december', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 11,
						day: 1
					})
				);
		});

		it('first month', function() {
			const now = new Date(2010, 5, 2);
			return month('first month', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 0,
						day: 1
					})
				);
		});

		it('5th month', function() {
			const now = new Date(2010, 5, 2);
			return month('5th month', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 4,
						day: 1
					})
				);
		});

		it('third', function() {
			const now = new Date(2010, 5, 2);
			return month('third', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 2,
						day: 1
					})
				);
		});

		it('this month', function() {
			const now = new Date(2010, 5, 2);
			return month('this month', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 5,
						day: 1
					})
				);
		});

		it('next month', function() {
			const now = new Date(2010, 0, 1);
			return month('next month', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 1,
						day: 1
					})
				);
		});

		it('last month', function() {
			const now = new Date(2010, 0, 1);
			return month('last month', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2009,
						month: 11,
						day: 1
					})
				);
		});

		it('in one month', function() {
			const now = new Date(2010, 0, 1);
			return month('in one month', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 1,
						day: 1
					})
				);
		});

		it('in 4 months', function() {
			const now = new Date(2010, 0, 1);
			return month('in 4 months', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'month',
						year: 2010,
						month: 4,
						day: 1
					})
				);
		});
	});

});
