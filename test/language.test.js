'use strict';

const chai = require('chai');
const expect = chai.expect;

const utils = require('../language/utils');
const en = require('../language/en');

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
						normalized: 'can'
					},
					{
						normalized: 'not'
					}
				];
			});
			expect(tokens.length).to.equal(2);
			expect(tokens[0].normalized).to.equal('can');
			expect(tokens[1].normalized).to.equal('not');
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

	describe('English: Tokenization', function() {
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
	});
})
