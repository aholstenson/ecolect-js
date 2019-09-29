import { en } from '../src/language/en';
import { GraphBuilder } from '../src/graph/GraphBuilder';
import { GraphMatcher, GraphMatcherOptions } from '../src/graph/matching';

const options: GraphMatcherOptions<any, any> = {
	reducer: ({ results }) => results.toArray().map(r => r.data)
};

describe('Graph Builder', function() {
	describe('Linear', function() {
		const graph = new GraphBuilder<boolean>(en)
			.add('hello world', true)
			.build();

		const matcher = new GraphMatcher(en, graph, options);

		it('All tokens', function() {
			return matcher.match('hello world')
				.then(results => {
					expect(results).toEqual([ true ]);
				});
		});

		it('Single token', function() {
			return matcher.match('hello')
				.then(results => {
					expect(results).toEqual([ ]);
				});
		});

		it('Extra tokens', function() {
			return matcher.match('hello world and more')
				.then(results => {
					expect(results).toEqual([]);
				});
		});

		it('Extra tokens - partial, no match', function() {
			return matcher.match('hello world and more', { partial: true })
				.then(results => {
					expect(results).toEqual([ ]);
				});
		});
	});

	describe('Multiple linear', function() {
		const graph = new GraphBuilder<number>(en)
			.add('hello world', 1)
			.add('cookies', 2)
			.add('hello', 3)
			.build();

		const matcher = new GraphMatcher(en, graph, options);

		it('Match longest - partial', function() {
			return matcher.match('hello world', { partial: true })
				.then(results => {
					expect(results).toEqual([ 1 ]);
				});
		});

		it('Match standalone', function() {
			return matcher.match('cookies')
				.then(results => {
					expect(results).toEqual([ 2 ]);
				});
		});

		it('Match shortest', function() {
			return matcher.match('hello')
				.then(results => {
					expect(results).toEqual([ 3 ]);
				});
		});
	});

	describe('Graph within graph', function() {
		describe('Single token + Single token', function() {
			const sub = new GraphBuilder<number>(en)
				.add('hello', 1)
				.build();

			const graph = new GraphBuilder<number>(en)
				.add([ sub, 'world' ], 2)
				.build();

			const matcher = new GraphMatcher(en, graph, options);

			it('All tokens', function() {
				return matcher.match('hello world')
					.then(results => {
						expect(results).toEqual([ 2 ]);
					});
			});

			it('First token', function() {
				return matcher.match('hello')
					.then(results => {
						expect(results).toEqual([ ]);
					});
			});
		});

		describe('Node factory', function() {
			const graph = new GraphBuilder<number>(en)
				.add(GraphBuilder.custom(t => t.raw === 'one' ? true : null), 1)
				.build();

			const matcher = new GraphMatcher(en, graph, options);

			it('Single token', function() {
				return matcher.match('one')
					.then(results => {
						expect(results).toEqual([ 1 ]);
					});
			});

			it('Invalid first token', function() {
				return matcher.match('three')
					.then(results => {
						expect(results).toEqual([ ]);
					});
			});
		});

		describe('Previous match', function() {
			const graph = new GraphBuilder<number>(en)
				.add('one', 1)
				.add('three', 3)
				.add([ GraphBuilder.result(v => v === 1), 'two' ], 2)
				.add([ GraphBuilder.result(v => v === 1), 'two', GraphBuilder.result(v => v === 3) ], 4)
				.build();

			const matcher = new GraphMatcher(en, graph, options);

			it('Single token', function() {
				return matcher.match('one')
					.then(results => {
						expect(results).toEqual([ 1 ]);
					});
			});

			it('All tokens - partial', function() {
				return matcher.match('one two', { partial: true })
					.then(results => {
						expect(results).toEqual([ 2 ]);
					});
			});

			it('Invalid first token - partial', function() {
				return matcher.match('three two', { partial: true })
					.then(results => {
						expect(results).toEqual([ ]);
					});
			});
		});

		describe('Recursive match', function() {
			const graph = new GraphBuilder<string>(en)
				.add(/^[a-z]$/, v => v[0])
				.add([ GraphBuilder.result(v => true), GraphBuilder.result(v => true) ], v => v[0] + v[1])
				.add([ GraphBuilder.result(v => true), '-', GraphBuilder.result(v => true) ], v => {
					return v[0] + v[1];
				})
				.build();

			const matcher = new GraphMatcher(en, graph, options);

			it('a', function() {
				return matcher.match('a')
					.then(results => {
						expect(results).toEqual([ 'a' ]);
					});
			});

			it('a b', function() {
				return matcher.match('a b')
					.then(results => {
						expect(results).toEqual([ 'ab' ]);
					});
			});

			it('a b c', function() {
				return matcher.match('a b c')
					.then(results => {
						expect(results).toEqual([ 'abc' ]);
					});
			});

			it('a b c d', function() {
				return matcher.match('a b c d')
					.then(results => {
						expect(results).toEqual([ 'abcd' ]);
					});
			});

			it('a - b c', function() {
				return matcher.match('a - b c')
					.then(results => {
						expect(results).toEqual([ 'abc' ]);
					});
			});

			it('abc', function() {
				return matcher.match('abc')
					.then(results => {
						expect(results).toEqual([ ]);
					});
			});
		});
	});
});
