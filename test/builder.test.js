'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../language/en');
const GraphBuilder = require('../graph/builder');
const map = results => results.map(r => r.data);

describe('Graph Builder', function() {
	describe('Linear', function() {
		const parser = new GraphBuilder(en)
			.add('hello world', true)
			.toMatcher();

		it('All tokens', function() {
			return parser.match('hello world')
				.then(map)
				.then(results => {
					expect(results).to.deep.equal([ true ]);
				});
		});

		it('Single token', function() {
			return parser.match('hello')
				.then(map)
				.then(results => {
					expect(results).to.deep.equal([ ]);
				});
		});

		it('Extra tokens', function() {
			return parser.match('hello world and more')
				.then(map)
				.then(results => {
					expect(results).to.deep.equal([]);
				});
		});

		it('Extra tokens - partial, no match', function() {
			return parser.match('hello world and more', { partial: true })
				.then(map)
				.then(results => {
					expect(results).to.deep.equal([ ]);
				});
		});
	});

	describe('Multiple linear', function() {
		const parser = new GraphBuilder(en)
			.add('hello world', 1)
			.add('cookies', 2)
			.add('hello', 3)
			.toMatcher();


		it('Match longest - partial', function() {
			return parser.match('hello world', { partial: true })
				.then(map)
				.then(results => {
					expect(results).to.deep.equal([ 1 ]);
				});
		});

		it('Match standalone', function() {
			return parser.match('cookies')
				.then(map)
				.then(results => {
					expect(results).to.deep.equal([ 2 ]);
				});
		});

		it('Match shortest', function() {
			return parser.match('hello')
				.then(map)
				.then(results => {
					expect(results).to.deep.equal([ 3 ]);
				});
		});
	});

	describe('Parser within parser', function() {
		describe('Single token + Single token', function() {
			const sub = new GraphBuilder(en)
				.add('hello', 1)
				.toMatcher();

			const parser = new GraphBuilder(en)
				.add([ sub, 'world' ], 2)
				.toMatcher();

			it('All tokens', function() {
				return parser.match('hello world')
					.then(map)
					.then(results => {
						expect(results).to.deep.equal([ 2 ]);
					});
			});

			it('First token', function() {
				return parser.match('hello')
					.then(map)
					.then(results => {
						expect(results).to.deep.equal([ ]);
					});
			});
		});

		describe('Node factory', function() {
			const parser = new GraphBuilder(en)
				.add(GraphBuilder.custom(t => t.raw === 'one' ? true : null), 1)
				.toMatcher();

			it('Single token', function() {
				return parser.match('one')
					.then(map)
					.then(results => {
						expect(results).to.deep.equal([ 1 ]);
					});
			});

			it('Invalid first token', function() {
				return parser.match('three')
					.then(map)
					.then(results => {
						expect(results).to.deep.equal([ ]);
					});
			});
		});

		describe('Previous match', function() {
			const parser = new GraphBuilder(en)
				.add('one', 1)
				.add('three', 3)
				.add([ GraphBuilder.result(v => v === 1), 'two' ], 2)
				.add([ GraphBuilder.result(v => v === 1), 'two', GraphBuilder.result(v => v === 3) ], 4)
				.toMatcher();

			it('Single token', function() {
				return parser.match('one')
					.then(map)
					.then(results => {
						expect(results).to.deep.equal([ 1 ]);
					});
			});

			it('All tokens - partial', function() {
				return parser.match('one two', { partial: true })
					.then(map)
					.then(results => {
						expect(results).to.deep.equal([ 4, 2 ]);
					});
			});

			it('Invalid first token - partial', function() {
				return parser.match('three two', { partial: true })
					.then(map)
					.then(results => {
						expect(results).to.deep.equal([ ]);
					});
			});
		});

		describe('Recursive match', function() {
			const parser = new GraphBuilder(en)
				.add(/^[a-z]$/, v => v[0])
				.add([ GraphBuilder.result(v => true), GraphBuilder.result(v => true) ], v => v[0] + v[1])
				.add([ GraphBuilder.result(v => true), '-', GraphBuilder.result(v => true) ], v => {
					return v[0] + v[1];
				})
				.toMatcher();

			it('a', function() {
				return parser.match('a')
					.then(map)
					.then(results => {
						expect(results).to.deep.equal([ 'a' ]);
					});
			});

			it('a b', function() {
				return parser.match('a b')
					.then(map)
					.then(results => {
						expect(results).to.deep.equal([ 'ab' ]);
					});
			});

			it('a b c', function() {
				return parser.match('a b c')
					.then(map)
					.then(results => {
						expect(results).to.deep.equal([ 'abc' ]);
					});
			});

			it('a b c d', function() {
				return parser.match('a b c d')
					.then(map)
					.then(results => {
						expect(results).to.deep.equal([ 'abcd' ]);
					});
			});

			it('a - b c', function() {
				return parser.match('a - b c')
					.then(map)
					.then(results => {
						expect(results).to.deep.equal([ 'abc' ]);
					});
			});

			it('abc', function() {
				return parser.match('abc')
					.then(map)
					.then(results => {
						expect(results).to.deep.equal([ ]);
					});
			});
		});
	});
});
