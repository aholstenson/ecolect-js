import { whitespaceTokenizer } from '@ecolect/tokenization';

import { GraphBuilder, GraphTokens } from '../src/GraphBuilder';
import { GraphMatcher, GraphMatcherOptions } from '../src/GraphMatcher';

const options: GraphMatcherOptions<any, any> = {
	mapper: m => m.data
};

const tokens: GraphTokens = {
	tokenizer: whitespaceTokenizer,
	tokenComparer: {
		compare(a, b) {
			if(a.normalized === b.normalized) return 1;

			return 0;
		},

		comparePartial(a, b) {
			if(a.normalized.indexOf(b.normalized) === 0) return 1.0;

			return 0;
		}
	}
};

describe('GraphBuilder', function() {
	describe('Linear', function() {
		const graph = new GraphBuilder<boolean>(tokens)
			.add('hello world', true)
			.build();

		const matcher = new GraphMatcher(graph, options);

		it('All tokens', function() {
			return matcher.match('hello world')
				.then(r => {
					expect(r).toEqual(true);
				});
		});

		it('Single token', function() {
			return matcher.match('hello')
				.then(r => {
					expect(r).toBeNull();
				});
		});

		it('Extra tokens', function() {
			return matcher.match('hello world and more')
				.then(r => {
					expect(r).toBeNull();
				});
		});

		it('Extra tokens - partial, no match', function() {
			return matcher.matchPartial('hello world and more')
				.then(r => {
					expect(r).toEqual([]);
				});
		});
	});

	describe('Multiple linear', function() {
		const graph = new GraphBuilder<number>(tokens)
			.add('hello world', 1)
			.add('cookies', 2)
			.add('hello', 3)
			.build();

		const matcher = new GraphMatcher(graph, options);

		it('Match longest - partial', function() {
			return matcher.matchPartial('hello world')
				.then(r => {
					expect(r).toEqual([ 1 ]);
				});
		});

		it('Match standalone', function() {
			return matcher.match('cookies')
				.then(r => {
					expect(r).toEqual(2);
				});
		});

		it('Match shortest', function() {
			return matcher.match('hello')
				.then(r => {
					expect(r).toEqual(3);
				});
		});
	});

	describe('Graph within graph', function() {
		describe('Single token + Single token', function() {
			const sub = new GraphBuilder<number>(tokens)
				.add('hello', 1)
				.build();

			const graph = new GraphBuilder<number>(tokens)
				.add([ sub, 'world' ], 2)
				.build();

			const matcher = new GraphMatcher(graph, options);

			it('All tokens', function() {
				return matcher.match('hello world')
					.then(r => {
						expect(r).toEqual(2);
					});
			});

			it('First token', function() {
				return matcher.match('hello')
					.then(r => {
						expect(r).toBeNull();
					});
			});
		});

		describe('Node factory', function() {
			const graph = new GraphBuilder<number>(tokens)
				.add(GraphBuilder.custom(t => t.raw === 'one' ? true : null), 1)
				.build();

			const matcher = new GraphMatcher(graph, options);

			it('Single token', function() {
				return matcher.match('one')
					.then(r => {
						expect(r).toEqual(1);
					});
			});

			it('Invalid first token', function() {
				return matcher.match('three')
					.then(r => {
						expect(r).toBeNull();
					});
			});
		});

		describe('Previous match', function() {
			const graph = new GraphBuilder<number>(tokens)
				.add('one', 1)
				.add('three', 3)
				.add([ GraphBuilder.result(v => v === 1), 'two' ], 2)
				.add([ GraphBuilder.result(v => v === 1), 'two', GraphBuilder.result(v => v === 3) ], 4)
				.build();

			const matcher = new GraphMatcher(graph, options);

			it('Single token', function() {
				return matcher.match('one')
					.then(r => {
						expect(r).toEqual(1);
					});
			});

			it('All tokens - partial', function() {
				return matcher.matchPartial('one two')
					.then(r => {
						expect(r).toEqual([ 2 ]);
					});
			});

			it('Invalid first token - partial', function() {
				return matcher.matchPartial('three two')
					.then(r => {
						expect(r).toEqual([ ]);
					});
			});
		});

		describe('Recursive match', function() {
			const graph = new GraphBuilder<string>(tokens)
				.add(/^[a-z]$/, v => v[0])
				.add([ GraphBuilder.result(v => true), GraphBuilder.result(v => true) ], v => v[0] + v[1])
				.add([ GraphBuilder.result(v => true), '-', GraphBuilder.result(v => true) ], v => {
					return v[0] + v[1];
				})
				.build();

			const matcher = new GraphMatcher(graph, options);

			it('a', function() {
				return matcher.match('a')
					.then(r => {
						expect(r).toEqual('a');
					});
			});

			it('a b', function() {
				return matcher.match('a b')
					.then(r => {
						expect(r).toEqual('ab');
					});
			});

			it('a b c', function() {
				return matcher.match('a b c')
					.then(r => {
						expect(r).toEqual('abc');
					});
			});

			it('a b c d', function() {
				return matcher.match('a b c d')
					.then(r => {
						expect(r).toEqual('abcd');
					});
			});

			it('a - b c', function() {
				return matcher.match('a - b c')
					.then(r => {
						expect(r).toEqual('abc');
					});
			});

			it('abc', function() {
				return matcher.match('abc')
					.then(r => {
						expect(r).toBeNull();
					});
			});
		});
	});
});
