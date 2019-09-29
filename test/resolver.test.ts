import { en } from '../src/language/en';
import 'jest-expect-message';

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
		const resolver = new ResolverBuilder(en)
			.add('one')
			.add('one two three')
			.build();

		it('#1', function() {
			return resolver.match('one')
				.then(r => expect(r.best).not.toBeNull());
		});

		it('#2', function() {
			return resolver.match('one two three')
				.then(r => expect(r.best).not.toBeNull());
		});

		it('#3', function() {
			return resolver.match('one two')
				.then(r => expect(r.best).toBeNull());
		});
	});

	describe('Graph with value of type any', function() {
		const resolver = new ResolverBuilder(en)
			.value('a', anyStringValue())
			.add('{a}')
			.add('one {a}')
			.add('{a} one')
			.build();

		it('#1', function() {
			return resolver.match('one')
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.best.values.get('a')).toEqual('one');
					expect(r.matches.length).toEqual(1);
				});
		});

		it('#2', function() {
			return resolver.match('one test')
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.best.values.get('a')).toEqual('test');
					expect(r.matches.length).toEqual(1);
				});
		});

		it('#3', function() {
			return resolver.match('test one')
			.then(r => {
				expect(r.best).not.toBeNull();
				expect(r.best.values.get('a')).toEqual('test');
				expect(r.matches.length).toEqual(1);
			});
		});

		it('#4', function() {
			return resolver.match('one one')
			.then(r => {
				expect(r.best).not.toBeNull();
				expect(r.best.values.get('a')).toEqual('one');
				expect(r.matches.length).toEqual(1);
			});
		});
	});

	describe('Graph with date', function() {
		const resolver = new ResolverBuilder(en)
			.value('date', dateValue())
			.add('stuff {date}')
			.add('{date} stuff')
			.add('stuff {date} cookie')
			.build();

		it('start', function() {
			return resolver.match('today stuff')
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.matches.length).toEqual(1);
				});
		});

		it('middle', function() {
			return resolver.match('stuff today cookie')
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.matches.length).toEqual(1);
				});
		});

		it('middle (no match)', function() {
			return resolver.match('stuff today a b')
				.then(r => {
					expect(r.best).toBeNull();
				});
		});

		it('end', function() {
			return resolver.match('stuff today')
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.matches.length).toEqual(1);
				});
		});

		it('end - trailing th', function() {
			return resolver.match('stuff jan 12th')
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.matches.length).toEqual(1);
				});
		});

		it('end - partial, trailing th', function() {
			return resolver.match('stuff jan 12th', { partial: true })
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.matches.length).toEqual(2);
				});
		});

		it('end - partial, trailing th', function() {
			return resolver.match('stuff j', { partial: true })
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.matches.length).toEqual(1);
				});
		});

		it('range (no match)', function() {
			return resolver.match('stuff Jan 12-14')
			.then(r => {
				expect(r.best).toBeNull();
			});
		});
	});

	describe('Partial matching', function() {
		const resolver = new ResolverBuilder(en)
			.add('hello world')
			.build();

		it('Full token', function() {

			return resolver.match('hello', {
				partial: true
			}).then(r => {
				expect(r.matches.length).toEqual(1);
			});
		});

		it('Partial token', function() {

			return resolver.match('he', {
				partial: true
			}).then(r => {
				expect(r.matches.length).toEqual(1);
			});
		});
	});

	describe('Partial matching with value', function() {
		const resolver = new ResolverBuilder(en)
			.value('test', customValue(async encounter => {
				if(encounter.text === 'world') {
					encounter.match(true);
				}
			}))
			.add('hello {test}')
			.build();

		it('No value', function() {

			return resolver.match('hello', {
				partial: true
			}).then(r => {
				expect(r.matches.length).toEqual(1);
			});
		});

		it('Value - valid', function() {
			return resolver.match('hello world', {
				partial: true
			}).then(r => {
				expect(r.matches.length).toEqual(1);
			});
		});

		it('Value - invalid', function() {
			return resolver.match('hello cookie', {
				partial: true
			}).then(r => {
				expect(r.matches.length).toEqual(0);
			});
		});
	});

	describe('Graph with number', function() {
		const resolver = new ResolverBuilder(en)
			.value('number', numberValue())
			.add('stuff {number}')
			.add('a {number} c')
			.build();

		it('With a number', function() {
			return resolver.match('stuff 2')
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('number')).toEqual({
						value: 2
					});
				});
		});

		it('Without a number', function() {
			return resolver.match('stuff abc')
				.then(results => {
					expect(results.matches.length).toEqual(0);
				});
		});

		it('With a number followed by garbage', function() {
			return resolver.match('stuff 2 abc')
				.then(results => {
					expect(results.matches.length).toEqual(0);
				});
		});

		it('With a more complex number', function() {
			return resolver.match('stuff 2 thousand')
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('number')).toEqual({
						value: 2000
					});
				});
		});

		it('With a number and trailing valid token', function() {
			return resolver.match('a two hundred c')
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('number')).toEqual({
						value: 200
					});
				});
		});
	});

	describe('Graph with boolean', function() {
		const resolver = new ResolverBuilder(en)
			.value('boolean', booleanValue())
			.add('stuff {boolean}')
			.add('a {boolean} c')
			.build();

		it('With a boolean', function() {
			return resolver.match('stuff off')
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('boolean')).toEqual(false);
				});
		});

		it('Without a boolean', function() {
			return resolver.match('stuff abc')
				.then(results => {
					expect(results.matches.length).toEqual(0);
				});
		});

		it('With a boolean followed by garbage', function() {
			return resolver.match('stuff off abc')
				.then(results => {
					expect(results.matches.length).toEqual(0);
				});
		});

		it('With yes', function() {
			return resolver.match('stuff yes')
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('boolean')).toEqual(true);
				});
		});

		it('With a boolean and trailing valid token', function() {
			return resolver.match('a false c')
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('boolean')).toEqual(false);
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
			const resolver = new ResolverBuilder(en)
				.value('name', customValue(async encounter => {
					let text = encounter.text;
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
				.add('do {name}')
				.build();

			it('Match', function() {
				return resolver.match('do one')
					.then(results => {
						expect(results.matches.length).toEqual(1);
						expect(results.best.values.get('name')).toEqual('one');

						// Check that the expression matches
						const expression = results.best.expression;
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
					.then(results => {
						expect(results.matches.length).toEqual(1);
						expect(results.best.values.get('name')).toEqual('four five');

						// Check that the expression matches
						const expression = results.best.expression;
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
					.then(results => {
						expect(results.matches.length).toEqual(0);
					});
			});

			it('Partial', function() {
				return resolver.match('do t', {
					partial: true
				})
					.then(results => {
						expect(results.matches.length).toEqual(2);

						// Check that the expressions matches
						checkExpression(results.matches[0].expression, [
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

						checkExpression(results.matches[1].expression, [
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
			const resolver = new ResolverBuilder(en)
				.value('name', customValue(async encounter => {
					let text = encounter.text;
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
				.add('{name} value')
				.build();

			it('Match', function() {
				return resolver.match('one value')
					.then(results => {
						expect(results.matches.length).toEqual(1);
						expect(results.best.values.get('name')).toEqual('one');

						// Check that the expression matches
						const expression = results.best.expression;
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
					.then(results => {
						expect(results.matches.length).toEqual(1);
						expect(results.best.values.get('name')).toEqual('four five');

						// Check that the expression matches
						const expression = results.best.expression;
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
					.then(results => {
						expect(results.matches.length).toEqual(0);
					});
			});

			it('Partial', function() {
				return resolver.match('t', {
					partial: true
				})
					.then(results => {
						expect(results.matches.length).toEqual(2);
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
			const resolver = new ResolverBuilder(en)
				.value('name', customValue({
					greedy: true,

					match: async function(encounter) {
						let text = encounter.text;
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
				.add('{name} end')
				.add('{name} value end')
				.build();

			it('Match', function() {
				return resolver.match('one value end')
					.then(results => {
						expect(results.matches.length).toEqual(1);
						expect(results.best.values.get('name')).toEqual('one');
					});
			});

			it('No match', function() {
				return resolver.match('four value')
					.then(results => {
						expect(results.matches.length).toEqual(0);
					});
			});

			it('Partial', function() {
				return resolver.match('one value', {
					partial: true
				})
					.then(results => {
						expect(results.matches.length).toEqual(2);
					});
			});
		});
	});

	describe('Graph contains matching expression', function() {
		const resolver = new ResolverBuilder(en)
			.value('boolean', booleanValue())
			.value('free', anyStringValue())
			.add('stuff {boolean}')
			.add('a {boolean} c')
			.add('longer {free} message')
			.build();

		it('Expression has source offsets', function() {
			return resolver.match('a yes c')
				.then(result => {
					const e = result.best.expression;

					expect(e.length).toEqual(3);
					expect(e[0].source).toEqual({ start: 0, end: 1 });
					expect(e[1].source).toEqual({ start: 2, end: 5 });
					expect(e[2].source).toEqual({ start: 6, end: 7 });
				});
		});

		it('Expression with any() has source offsets', function() {
			return resolver.match('longer hello world message')
				.then(result => {
					const e = result.best.expression;

					expect(e.length).toEqual(3);
					expect(e[0].source).toEqual({ start: 0, end: 6 });
					expect(e[1].source).toEqual({ start: 7, end: 18 });
					expect(e[2].source).toEqual({ start: 19, end: 26 });
				});
		});
	});
});
