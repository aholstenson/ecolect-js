'use strict';

const chai = require('chai');
const expect = chai.expect;

const utils = require('../language/utils');
const en = require('../language/en');

function checkTokens(tokens, raw) {
	expect(tokens.length).to.equal(raw.length, 'Wrong number of tokens extracted');

	for(let i=0; i<raw.length; i++) {
		expect(tokens[i].raw).to.equal(raw[i], 'Token ' + i + ' does not match');
	}
}

describe('Language', function() {
	describe('Utils: Tokenization', function() {
		it('Single token', function() {
			const tokens = utils.tokenize('hello', t => t);
			expect(tokens.length).to.equal(1);
			expect(tokens[0].raw).to.equal('hello');
			expect(tokens[0].start).to.equal(0);
			expect(tokens[0].stop).to.equal(5);
		});

		it('Multiple tokens', function() {
			const tokens = utils.tokenize('hello world', t => t);
			expect(tokens.length).to.equal(2);
			expect(tokens[0].raw).to.equal('hello');
			expect(tokens[1].raw).to.equal('world');
		});

		it('Single to multiple tokens', function() {
			const tokens = utils.tokenize('can\'t', t => {
				return [
					{
						raw: 'ca',
						normalized: 'can'
					},
					{
						raw: 'n\'t',
						normalized: 'not'
					}
				];
			});
			expect(tokens.length).to.equal(2);
			expect(tokens[0].normalized).to.equal('can');
			expect(tokens[0].start).to.equal(0);
			expect(tokens[0].stop).to.equal(2);

			expect(tokens[1].normalized).to.equal('not');
			expect(tokens[1].start).to.equal(2);
			expect(tokens[1].stop).to.equal(5);
		});

		describe('Spliting', function() {
			it('Parenthesies', function() {
				const tokens = utils.tokenize('(abc)', t => t);
				checkTokens(tokens, [ '(', 'abc', ')']);
			});

			it('Brackets', function() {
				const tokens = utils.tokenize('[abc]', t => t);
				checkTokens(tokens, [ '[', 'abc', ']']);
			});

			it('Exclamation marks', function() {
				checkTokens(
					utils.tokenize('abc!', t => t),
					[ 'abc', '!']
				);

				checkTokens(
					utils.tokenize('a!bc', t => t),
					[ 'a', '!', 'bc' ]
				);
			});

			it('Question marks', function() {
				checkTokens(
					utils.tokenize('abc?', t => t),
					[ 'abc', '?']
				);

				checkTokens(
					utils.tokenize('a?bc', t => t),
					[ 'a', '?', 'bc' ]
				);
			});

			it('Period', function() {
				checkTokens(
					utils.tokenize('abc.', t => t),
					[ 'abc', '.']
				);

				checkTokens(
					utils.tokenize('a.bc', t => t),
					[ 'a', '.', 'bc' ]
				);
			});

			it('Comma', function() {
				checkTokens(
					utils.tokenize('abc,', t => t),
					[ 'abc', ',']
				);

				checkTokens(
					utils.tokenize('a,bc', t => t),
					[ 'a', ',', 'bc' ]
				);
			});

			it('Numbers', function() {
				checkTokens(
					utils.tokenize('12', t => t),
					[ '12' ]
				);

				checkTokens(
					utils.tokenize('12.20', t => t),
					[ '12', '.', '20' ]
				);

				checkTokens(
					utils.tokenize('12.20SEK', t => t),
					[ '12', '.', '20', 'SEK' ]
				);

				checkTokens(
					utils.tokenize('12SEK', t => t),
					[ '12', 'SEK' ]
				);

				checkTokens(
					utils.tokenize('SEK12', t => t),
					[ 'SEK', '12' ]
				);

				checkTokens(
					utils.tokenize('$12.20', t => t),
					[ '$', '12', '.', '20' ]
				);

				checkTokens(
					utils.tokenize('€12.20', t => t),
					[ '€', '12', '.', '20' ]
				);
			});
		});
	});

	describe('Utils: Raw Value', function() {
		it('Single token', function() {
			const tokens = utils.tokenize('hello', t => t);
			const raw = utils.raw(tokens);
			expect(raw).to.equal('hello');
		});

		it('Multiple tokens', function() {
			const tokens = utils.tokenize('hello world', t => t);
			const raw = utils.raw(tokens);
			expect(raw).to.equal('hello world');
		});
	});
})
