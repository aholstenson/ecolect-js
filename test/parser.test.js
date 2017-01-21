'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../language/en');
const Parser = require('../parser');

describe('Parser', function() {
	describe('Linear', function() {
		const parser = new Parser(en)
			.add('hello world', true);

		it('All tokens', function() {
			return parser.match('hello world')
				.then(results => {
					expect(results).to.deep.equal([ true ]);
				});
		});

		it('Single token', function() {
			return parser.match('hello')
				.then(results => {
					expect(results).to.deep.equal([ ]);
				});
		});

		it('Extra tokens', function() {
			return parser.match('hello world and more')
				.then(results => {
					expect(results).to.deep.equal([ true ]);
				});
		});
	});

	describe('Multiple linear', function() {
		const parser = new Parser(en)
			.add('hello world', 1)
			.add('cookies', 2)
			.add('hello', 3);


		it('Match longest', function() {
			return parser.match('hello world')
				.then(results => {
					expect(results).to.deep.equal([ 1, 3 ]);
				});
		});

		it('Match standalone', function() {
			return parser.match('cookies')
				.then(results => {
					expect(results).to.deep.equal([ 2 ]);
				});
		});

		it('Match shortest', function() {
			return parser.match('hello')
				.then(results => {
					expect(results).to.deep.equal([ 3 ]);
				});
		});
	});

	describe('Parser within parser', function() {
		describe('Single token + Single token', function() {
			const sub = new Parser(en)
				.add('hello', 1);

			const parser = new Parser(en)
				.add([ sub, 'world' ], 2);

			it('All tokens', function() {
				return parser.match('hello world')
					.then(results => {
						expect(results).to.deep.equal([ 2 ])
					});
			});

			it('First token', function() {
				return parser.match('hello')
					.then(results => {
						expect(results).to.deep.equal([ ])
					});
			});
		});

		describe('Function', function() {
			const parser = new Parser(en)
				.add('one', 1)
				.add('three', 3)
				.add([ v => v == 1, 'two' ], 2);

			it('Single token', function() {
				return parser.match('one')
					.then(results => {
						expect(results).to.deep.equal([ 1 ])
					});
			});

			it('All tokens', function() {
				return parser.match('one two')
					.then(results => {
						expect(results).to.deep.equal([ 1, 2 ])
					});
			});

			it('Invalid first token', function() {
				return parser.match('three two')
					.then(results => {
						expect(results).to.deep.equal([ 3 ])
					});
			});
		});
	});
});
