'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../../../language/en');
const year = (text, options) => en.year.match(text, options);

describe('English', function() {

	describe('Year', function() {
		it('2018', function() {
			return year('2018')
				.then(v =>
					expect(v).to.deep.equal({
						period: 'year',
						year: 2018,
						month: 0,
						day: 1
					})
				);
		});

		it('this year', function() {
			return year('this year')
				.then(v =>
					expect(v).to.deep.equal({
						period: 'year',
						year: new Date().getFullYear(),
						month: 0,
						day: 1
					})
				);
		});

		it('in 4 years', function() {
			return year('in 4 years', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({
						period: 'year',
						year: 2014,
						month: 0,
						day: 1
					})
				);
		});
	});

});
