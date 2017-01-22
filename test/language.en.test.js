'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../language/en');
const number = text => en.number.match(text);

describe('English', function() {
	describe('Tokenization', function() {
		it('Simple: Hello World', function() {
			const tokens = en.tokenize('hello world');
			expect(tokens.length).to.equal(2);
			expect(tokens[0].raw).to.equal('hello');
			expect(tokens[1].raw).to.equal('world');
		});

		it('Contraction: Wasn\'t', function() {
			const tokens = en.tokenize('Wasn\'t');
			expect(tokens.length).to.equal(2);
			expect(tokens[0].normalized).to.equal('was');
			expect(tokens[1].normalized).to.equal('not');
		});

		it('Contraction: Can\'t', function() {
			const tokens = en.tokenize('Can\'t');
			expect(tokens.length).to.equal(2);
			expect(tokens[0].normalized).to.equal('can');
			expect(tokens[1].normalized).to.equal('not');
		});

		it('Contraction: I\'m', function() {
			const tokens = en.tokenize('I\'m');
			expect(tokens.length).to.equal(2);
			expect(tokens[0].normalized).to.equal('i');
			expect(tokens[1].normalized).to.equal('am');
		});

		it('Contraction: You\'re', function() {
			const tokens = en.tokenize('You\'re');
			expect(tokens.length).to.equal(2);
			expect(tokens[0].normalized).to.equal('you');
			expect(tokens[1].normalized).to.equal('are');
		});

		it('Contraction: They\'ll', function() {
			const tokens = en.tokenize('They\'ll');
			expect(tokens.length).to.equal(2);
			expect(tokens[0].normalized).to.equal('they');
			expect(tokens[1].normalized).to.equal('will');
		});
	});

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
	});
					expect(v).to.deep.equal([
						{ value: 1 },
						{ value: 1400 }
					])
				);
		});


	});
});
