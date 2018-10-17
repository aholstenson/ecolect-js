'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../../../language/en');
const number = text => en.number.match(text);

describe('English', function() {

	describe('Numbers', function() {
		it('one', function() {
			return number('one')
				.then(v =>
					expect(v).to.deep.equal({ value: 1 })
				);
		});

		it('1', function() {
			return number('1')
				.then(v =>
					expect(v).to.deep.equal({ value: 1 })
				);
		});

		it('1.4', function() {
			return number('1.4')
				.then(v =>
					expect(v).to.deep.equal({ value: 1.4 })
				);
		});

		it('1 4', function() {
			return number('1 4')
				.then(v =>
					expect(v).to.deep.equal({ value: 14 })
				);
		});

		it('thousand', function() {
			return number('thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000 })
				);
		});

		it('one thousand', function() {
			return number('one thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000 })
				);
		});

		it('1 thousand', function() {
			return number('1 thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000 })
				);
		});

		it('1.2 thousand', function() {
			return number('1.2 thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1200 })
				);
		});

		it('1 400', function() {
			return number('1 400')
				.then(v =>
					expect(v).to.deep.equal({ value: 1400 })
				);
		});

		it('two dozen', function() {
			return number('two dozen')
				.then(v =>
					expect(v).to.deep.equal({ value: 24 })
				);
		});

		it('100k', function() {
			return number('100k')
				.then(v =>
					expect(v).to.deep.equal({ value: 100000 })
				);
		});

		it('-100', function() {
			return number('-100')
				.then(v =>
					expect(v).to.deep.equal({ value: -100 })
				);
		});

		it('-1 000', function() {
			return number('-1 000')
				.then(v =>
					expect(v).to.deep.equal({ value: -1000 })
				);
		});

		it('minus one million', function() {
			return number('minus one million')
				.then(v =>
					expect(v).to.deep.equal({ value: -1000000 })
				);
		});

		it('1 thousand thousand', function() {
			return number('1 thousand thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000000 })
				);
		});

		it('1e3', function() {
			return number('1e3')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000 })
				);
		});

		it('1e-3', function() {
			return number('1e-3')
				.then(v =>
					expect(v).to.deep.equal({ value: 0.001 })
				);
		});

		it('1.4e3', function() {
			return number('1.4e3')
				.then(v =>
					expect(v).to.deep.equal({ value: 1400 })
				);
		});
	});

});
