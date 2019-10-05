import { en } from '../src/language/en';
import 'jest-expect-message';

import { BigDecimal } from 'numeric-types/decimal';

import { ResolverBuilder } from '../src/resolver/ResolverBuilder';
import { anyStringValue, dateValue, numberValue, booleanValue, customValue } from '../src/values';

function checkExpression(expression: any[], expected: any[]) {
	expect(expression.length).toEqual(expected.length);

	for(let i=0; i<expression.length; i++) {
		const o = expression[i];
		const v = expected[i];

		expect(o.type, 'part ' + i + ' type').toEqual(v.type);
		expect(o.id, 'part ' + i + ' id').toEqual(v.id);
		expect(o.value, 'part ' + i + ' value').toEqual(v.value);
		expect(o.source.start, 'part ' + i + ' start').toEqual(v.start);
		expect(o.source.end, 'part ' + i + ' end').toEqual(v.end);
	}
}

describe('Resolver', function() {
	describe('Graph without value', function() {
		const resolver = new ResolverBuilder()
			.phrase('one')
			.phrase('one two three')
			.toMatcher(en);

		it('#1', function() {
			return resolver.match('one')
				.then(r => expect(r).not.toBeNull());
		});

		it('#2', function() {
			return resolver.match('one two three')
				.then(r => expect(r).not.toBeNull());
		});

		it('#3', function() {
			return resolver.match('one two')
				.then(r => expect(r).toBeNull());
		});
	});

	describe('Graph with value of type any', function() {
		const resolver = new ResolverBuilder()
			.value('a', anyStringValue())
			.phrase('{a}')
			.phrase('one {a}')
			.phrase('{a} one')
			.toMatcher(en);

		it('#1', function() {
			return resolver.match('one')
				.then(r => {
					expect(r).not.toBeNull();
					expect(r.values.a).toEqual('one');
				});
		});

		it('#2', function() {
			return resolver.match('one test')
				.then(r => {
					expect(r).not.toBeNull();
					expect(r.values.a).toEqual('test');
				});
		});

		it('#3', function() {
			return resolver.match('test one')
			.then(r => {
				expect(r).not.toBeNull();
				expect(r.values.a).toEqual('test');
			});
		});

		it('#4', function() {
			return resolver.match('one one')
			.then(r => {
				expect(r).not.toBeNull();
				expect(r.values.a).toEqual('one');
			});
		});
	});

	describe('Graph with date', function() {
		const resolver = new ResolverBuilder()
			.value('date', dateValue())
			.phrase('stuff {date}')
			.phrase('{date} stuff')
			.phrase('stuff {date} cookie')
			.toMatcher(en);

		it('start', function() {
			return resolver.match('today stuff')
				.then(r => {
					expect(r).not.toBeNull();
				});
		});

		it('middle', function() {
			return resolver.match('stuff today cookie')
				.then(r => {
					expect(r).not.toBeNull();
				});
		});

		it('middle (no match)', function() {
			return resolver.match('stuff today a b')
				.then(r => {
					expect(r).toBeNull();
				});
		});

		it('end', function() {
			return resolver.match('stuff today')
				.then(r => {
					expect(r).not.toBeNull();
				});
		});

		it('end - trailing th', function() {
			return resolver.match('stuff jan 12th')
				.then(r => {
					expect(r).not.toBeNull();
				});
		});

		it('end - partial, trailing th', function() {
			return resolver.matchPartial('stuff jan 12th')
				.then(r => {
					expect(r.length).toEqual(2);
				});
		});

		it('end - partial, trailing th', function() {
			return resolver.matchPartial('stuff j')
				.then(r => {
					expect(r.length).toEqual(1);
				});
		});

		it('range (no match)', function() {
			return resolver.match('stuff Jan 12-14')
				.then(r => {
					expect(r).toBeNull();
				});
		});
	});

	describe('Partial matching', function() {
		const resolver = new ResolverBuilder()
			.phrase('hello world')
			.toMatcher(en);

		it('Full token', function() {
			return resolver.matchPartial('hello')
				.then(r => {
					expect(r.length).toEqual(1);
				});
		});

		it('Partial token', function() {
			return resolver.matchPartial('he')
				.then(r => {
					expect(r.length).toEqual(1);
				});
		});
	});

	describe('Partial matching with value', function() {
		const resolver = new ResolverBuilder()
			.value('test', customValue(async encounter => {
				if(encounter.text === 'world') {
					encounter.match(true);
				}
			}))
			.phrase('hello {test}')
			.toMatcher(en);

		it('No value', function() {
			return resolver.matchPartial('hello')
				.then(r => {
					expect(r.length).toEqual(1);
				});
		});

		it('Value - valid', function() {
			return resolver.matchPartial('hello world')
				.then(r => {
					expect(r.length).toEqual(1);
				});
		});

		it('Value - invalid', function() {
			return resolver.matchPartial('hello cookie')
				.then(r => {
					expect(r.length).toEqual(0);
				});
		});
	});

	describe('Graph with number', function() {
		const resolver = new ResolverBuilder()
			.value('number', numberValue())
			.phrase('stuff {number}')
			.phrase('a {number} c')
			.toMatcher(en);

		it('With a number', function() {
			return resolver.match('stuff 2')
				.then(r => {
					expect(r).not.toBeNull();
					expect(r.values.number).toEqual(BigDecimal.fromNumber(2));
				});
		});

		it('Without a number', function() {
			return resolver.match('stuff abc')
				.then(r => {
					expect(r).toBeNull();
				});
		});

		it('With a number followed by garbage', function() {
			return resolver.match('stuff 2 abc')
				.then(r => {
					expect(r).toBeNull();
				});
		});

		it('With a more complex number', function() {
			return resolver.match('stuff 2 thousand')
				.then(r => {
					expect(r).not.toBeNull();
					expect(r.values.number).toEqual(BigDecimal.fromNumber(2000));
				});
		});

		it('With a number and trailing valid token', function() {
			return resolver.match('a two hundred c')
				.then(r => {
					expect(r).not.toBeNull();
					expect(r.values.number).toEqual(BigDecimal.fromNumber(200));
				});
		});
	});

	describe('Graph with boolean', function() {
		const resolver = new ResolverBuilder()
			.value('boolean', booleanValue())
			.phrase('stuff {boolean}')
			.phrase('a {boolean} c')
			.toMatcher(en);

		it('With a boolean', function() {
			return resolver.match('stuff off')
				.then(r => {
					expect(r).not.toBeNull();
					expect(r.values.boolean).toEqual(false);
				});
		});

		it('Without a boolean', function() {
			return resolver.match('stuff abc')
				.then(r => {
					expect(r).toBeNull();
				});
		});

		it('With a boolean followed by garbage', function() {
			return resolver.match('stuff off abc')
				.then(r => {
					expect(r).toBeNull();
				});
		});

		it('With yes', function() {
			return resolver.match('stuff yes')
				.then(r => {
					expect(r).not.toBeNull();
					expect(r.values.boolean).toEqual(true);
				});
		});

		it('With a boolean and trailing valid token', function() {
			return resolver.match('a false c')
				.then(r => {
					expect(r).not.toBeNull();
					expect(r.values.boolean).toEqual(false);
				});
		});
	});

	describe('Graphs with custom values', function() {

		describe('Single enumeration-like, no trailing', function() {
			const values = [
				'one',
				'two',
				'three',
				'four five'
			];
			const resolver = new ResolverBuilder()
				.value('name', customValue(async encounter => {
					const text = encounter.text;
					if(encounter.partial) {
						for(const v of values) {
							if(v.indexOf(text) === 0) {
								encounter.match(v);
							}
						}
					} else {
						if(values.indexOf(text) >= 0) {
							encounter.match(text);
						}
					}
				}))
				.phrase('do {name}')
				.toMatcher(en);

			it('Match', function() {
				return resolver.match('do one')
					.then(r => {
						expect(r).not.toBeNull();
						expect(r.values.name).toEqual('one');

						// Check that the expression matches
						const expression = r.expression;
						checkExpression(expression, [
							{
								type: 'text',
								value: 'do',
								start: 0,
								end: 2
							},

							{
								type: 'value',
								id: 'name',
								value: 'one',
								start: 3,
								end: 6
							}
						]);
					});
			});

			it('Match multiple', function() {
				return resolver.match('do four five')
					.then(r => {
						expect(r).not.toBeNull();
						expect(r.values.name).toEqual('four five');

						// Check that the expression matches
						const expression = r.expression;
						checkExpression(expression, [
							{
								type: 'text',
								value: 'do',
								start: 0,
								end: 2
							},

							{
								type: 'value',
								id: 'name',
								value: 'four five',
								start: 3,
								end: 12
							}
						]);
					});
			});

			it('No match', function() {
				return resolver.match('do four')
					.then(r => {
						expect(r).toBeNull();
					});
			});

			it('Partial', function() {
				return resolver.matchPartial('do t')
					.then(r => {
						expect(r.length).toEqual(2);

						// Check that the expressions matches
						checkExpression(r[0].expression, [
							{
								type: 'text',
								value: 'do',
								start: 0,
								end: 2
							},

							{
								type: 'value',
								id: 'name',
								value: 'two',
								start: 3,
								end: 4
							}
						]);

						checkExpression(r[1].expression, [
							{
								type: 'text',
								value: 'do',
								start: 0,
								end: 2
							},

							{
								type: 'value',
								id: 'name',
								value: 'three',
								start: 3,
								end: 4
							}
						]);
					});
			});
		});

		describe('Single enumeration-like, trailing', function() {
			const values = [
				'one',
				'two',
				'three',
				'four five'
			];
			const resolver = new ResolverBuilder()
				.value('name', customValue(async encounter => {
					const text = encounter.text;
					if(encounter.partial) {
						for(const v of values) {
							if(v.indexOf(text) === 0) {
								encounter.match(v);
							}
						}
					} else {
						if(values.indexOf(text) >= 0) {
							encounter.match(text);
						}
					}
				}))
				.phrase('{name} value')
				.toMatcher(en);

			it('Match', function() {
				return resolver.match('one value')
					.then(r => {
						expect(r).not.toBeNull();
						expect(r.values.name).toEqual('one');

						// Check that the expression matches
						const expression = r.expression;
						checkExpression(expression, [
							{
								type: 'value',
								id: 'name',
								value: 'one',
								start: 0,
								end: 3
							},

							{
								type: 'text',
								value: 'value',
								start: 4,
								end: 9
							},
						]);
					});
			});

			it('Match multiple', function() {
				return resolver.match('four five value')
					.then(r => {
						expect(r).not.toBeNull();
						expect(r.values.name).toEqual('four five');

						// Check that the expression matches
						const expression = r.expression;
						checkExpression(expression, [
							{
								type: 'value',
								id: 'name',
								value: 'four five',
								start: 0,
								end: 9
							},

							{
								type: 'text',
								value: 'value',
								start: 10,
								end: 15
							},
						]);
					});
			});

			it('No match', function() {
				return resolver.match('four value')
					.then(r => {
						expect(r).toBeNull();
					});
			});

			it('Partial', function() {
				return resolver.matchPartial('t')
					.then(r => {
						expect(r.length).toEqual(2);
					});
			});
		});

		describe('Single enumeration-like, greedy', function() {
			const values = [
				'one',
				'one value',
				'two',
				'three',
				'four five'
			];
			const resolver = new ResolverBuilder()
				.value('name', customValue({
					greedy: true,

					match: async function(encounter) {
						const text = encounter.text;
						if(encounter.partial) {
							for(const v of values) {
								if(v.indexOf(text) === 0) {
									encounter.match(v);
								}
							}
						} else {
							if(values.indexOf(text) >= 0) {
								encounter.match(text);
							}
						}
					}
				}))
				.phrase('{name} end')
				.phrase('{name} value end')
				.toMatcher(en);

			it('Match', function() {
				return resolver.match('one value end')
					.then(r => {
						expect(r).not.toBeNull();
						expect(r.values.name).toEqual('one');
					});
			});

			it('No match', function() {
				return resolver.match('four value')
					.then(r => {
						expect(r).toBeNull();
					});
			});

			it('Partial', function() {
				return resolver.matchPartial('one value')
					.then(r => {
						expect(r.length).toEqual(2);
					});
			});
		});
	});

	describe('Graph contains matching expression', function() {
		const resolver = new ResolverBuilder()
			.value('boolean', booleanValue())
			.value('free', anyStringValue())
			.phrase('stuff {boolean}')
			.phrase('a {boolean} c')
			.phrase('longer {free} message')
			.toMatcher(en);

		it('Expression has source offsets', function() {
			return resolver.match('a yes c')
				.then(r => {
					const e = r.expression;

					expect(e.length).toEqual(3);
					expect(e[0].source).toEqual({ start: 0, end: 1 });
					expect(e[1].source).toEqual({ start: 2, end: 5 });
					expect(e[2].source).toEqual({ start: 6, end: 7 });
				});
		});

		it('Expression with any() has source offsets', function() {
			return resolver.match('longer hello world message')
				.then(r => {
					const e = r.expression;

					expect(e.length).toEqual(3);
					expect(e[0].source).toEqual({ start: 0, end: 6 });
					expect(e[1].source).toEqual({ start: 7, end: 18 });
					expect(e[2].source).toEqual({ start: 19, end: 26 });
				});
		});
	});
});
