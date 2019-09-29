import { en } from '../src/language/en';
import { GraphBuilder } from '../src/graph/GraphBuilder';

describe('Graph Builder', function() {
	describe('Linear', function() {
		const parser = new GraphBuilder<boolean>(en)
			.add('hello world', true)
			.toMatcher();

		it('All tokens', function() {
			return parser.match('hello world')
				.then(results => {
					expect(results).toEqual([ true ]);
				});
		});

		it('Single token', function() {
			return parser.match('hello')
				.then(results => {
					expect(results).toEqual([ ]);
				});
		});

		it('Extra tokens', function() {
			return parser.match('hello world and more')
				.then(results => {
					expect(results).toEqual([]);
				});
		});

		it('Extra tokens - partial, no match', function() {
			return parser.match('hello world and more', { partial: true })
				.then(results => {
					expect(results).toEqual([ ]);
				});
		});
	});

	describe('Multiple linear', function() {
		const parser = new GraphBuilder<number>(en)
			.add('hello world', 1)
			.add('cookies', 2)
			.add('hello', 3)
			.toMatcher();


		it('Match longest - partial', function() {
			return parser.match('hello world', { partial: true })
				.then(results => {
					expect(results).toEqual([ 1 ]);
				});
		});

		it('Match standalone', function() {
			return parser.match('cookies')
				.then(results => {
					expect(results).toEqual([ 2 ]);
				});
		});

		it('Match shortest', function() {
			return parser.match('hello')
				.then(results => {
					expect(results).toEqual([ 3 ]);
				});
		});
	});

	describe('Parser within parser', function() {
		describe('Single token + Single token', function() {
			const sub = new GraphBuilder<number>(en)
				.add('hello', 1)
				.toMatcher();

			const parser = new GraphBuilder<number>(en)
				.add([ sub, 'world' ], 2)
				.toMatcher();

			it('All tokens', function() {
				return parser.match('hello world')
					.then(results => {
						expect(results).toEqual([ 2 ]);
					});
			});

			it('First token', function() {
				return parser.match('hello')
					.then(results => {
						expect(results).toEqual([ ]);
					});
			});
		});

		describe('Node factory', function() {
			const parser = new GraphBuilder<number>(en)
				.add(GraphBuilder.custom(t => t.raw === 'one' ? true : null), 1)
				.toMatcher();

			it('Single token', function() {
				return parser.match('one')
					.then(results => {
						expect(results).toEqual([ 1 ]);
					});
			});

			it('Invalid first token', function() {
				return parser.match('three')
					.then(results => {
						expect(results).toEqual([ ]);
					});
			});
		});

		describe('Previous match', function() {
			const parser = new GraphBuilder<number>(en)
				.add('one', 1)
				.add('three', 3)
				.add([ GraphBuilder.result(v => v === 1), 'two' ], 2)
				.add([ GraphBuilder.result(v => v === 1), 'two', GraphBuilder.result(v => v === 3) ], 4)
				.toMatcher();

			it('Single token', function() {
				return parser.match('one')
					.then(results => {
						expect(results).toEqual([ 1 ]);
					});
			});

			it('All tokens - partial', function() {
				return parser.match('one two', { partial: true })
					.then(results => {
						expect(results).toEqual([ 2 ]);
					});
			});

			it('Invalid first token - partial', function() {
				return parser.match('three two', { partial: true })
					.then(results => {
						expect(results).toEqual([ ]);
					});
			});
		});

		describe('Recursive match', function() {
			const parser = new GraphBuilder<string>(en)
				.add(/^[a-z]$/, v => v[0])
				.add([ GraphBuilder.result(v => true), GraphBuilder.result(v => true) ], v => v[0] + v[1])
				.add([ GraphBuilder.result(v => true), '-', GraphBuilder.result(v => true) ], v => {
					return v[0] + v[1];
				})
				.toMatcher();

			it('a', function() {
				return parser.match('a')
					.then(results => {
						expect(results).toEqual([ 'a' ]);
					});
			});

			it('a b', function() {
				return parser.match('a b')
					.then(results => {
						expect(results).toEqual([ 'ab' ]);
					});
			});

			it('a b c', function() {
				return parser.match('a b c')
					.then(results => {
						expect(results).toEqual([ 'abc' ]);
					});
			});

			it('a b c d', function() {
				return parser.match('a b c d')
					.then(results => {
						expect(results).toEqual([ 'abcd' ]);
					});
			});

			it('a - b c', function() {
				return parser.match('a - b c')
					.then(results => {
						expect(results).toEqual([ 'abc' ]);
					});
			});

			it('abc', function() {
				return parser.match('abc')
					.then(results => {
						expect(results).toEqual([ ]);
					});
			});
		});
	});
});
