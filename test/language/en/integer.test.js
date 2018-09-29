'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../../../language/en');
const integer = text => en.integer.match(text);

describe('English', function() {

	describe('Integer', function() {
		it('one', function() {
			return integer('one')
				.then(v =>
					expect(v).to.deep.equal({ value: 1 })
				);
		});

		it('1', function() {
			return integer('1')
				.then(v =>
					expect(v).to.deep.equal({ value: 1 })
				);
		});

		it('1 4', function() {
			return integer('1 4')
				.then(v =>
					expect(v).to.deep.equal({ value: 14 })
				);
		});

		it('thousand', function() {
			return integer('thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000 })
				);
		});

		it('one thousand', function() {
			return integer('one thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000 })
				);
		});

		it('1 thousand', function() {
			return integer('1 thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000 })
				);
		});

		it('1 400', function() {
			return integer('1 400')
				.then(v =>
					expect(v).to.deep.equal({ value: 1400 })
				);
		});

		it('two dozen', function() {
			return integer('two dozen')
				.then(v =>
					expect(v).to.deep.equal({ value: 24 })
				);
		});

		it('100k', function() {
			return integer('100k')
				.then(v =>
					expect(v).to.deep.equal({ value: 100000 })
				);
		});

		it('-100', function() {
			return integer('-100')
				.then(v =>
					expect(v).to.equal(null)
				);
		});

		it('-1 000', function() {
			return integer('-1 000')
				.then(v =>
					expect(v).to.equal(null)
				);
		});

		it('minus one million', function() {
			return integer('minus one million')
				.then(v =>
					expect(v).to.equal(null)
				);
		});

		it('1 thousand thousand', function() {
			return integer('1 thousand thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000000 })
				);
		});

		it('one 000', function() {
			return integer('one 000')
				.then(v =>
					expect(v).to.deep.equal(null)
				);
		});
	});
});
