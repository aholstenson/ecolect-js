import { en } from '../src/language/en';
import { ResolverBuilder } from '../src/resolver/ResolverBuilder';

import { optionsValue, dateIntervalValue, enumerationValue, customValue } from '../src/values';
import { newPhrases } from '../src/resolver/newPhrases';

describe('Value: Options', function() {

	describe('Standalone option: No values', () => {
		const matcher = optionsValue()
			.option('deadline')
				.phrase('with deadline')
				.done()
			.build()
			.matcher(en);

		it('with deadline [partial=false]', () => matcher.match('with deadline')
			.then(v => {
				expect(v.toArray()).toEqual([
					{
						option: 'deadline',
						values: {},
					}
				]);

				const option = v.get('deadline');
				expect(option.expression).toEqual([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 13 }
					}
				]);
			})
		);

		it('with deadline [partial=true]', () => matcher.matchPartial('with deadline')
			.then(r => {
				expect(r.length).toEqual(1);

				expect(r[0].toArray()).toEqual([
					{
						option: 'deadline',
						values: {},
					}
				]);

				const option = r[0].get('deadline');
				expect(option.expression).toEqual([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 13 }
					}
				]);
			})
		);

		it('with [partial=true]', () => matcher.matchPartial('with')
			.then(r => {
				expect(r.length).toEqual(1);

				expect(r[0].toArray()).toEqual([
					{
						option: 'deadline',
						values: {},
					}
				]);

				const option = r[0].get('deadline');
				expect(option.expression).toEqual([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 4 }
					}
				]);
			})
		);

		it('with d [partial=true]', () => matcher.matchPartial('with d')
			.then(r => {
				expect(r.length).toEqual(1);

				expect(r[0].toArray()).toEqual([
					{
						option: 'deadline',
						values: {},
					}
				]);

				const option = r[0].get('deadline');
				expect(option.expression).toEqual([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 6 }
					}
				]);
			})
		);

		it('with deadline and wi [partial=true]', () => matcher.matchPartial('with deadline and wi')
			.then(r => {
				expect(r.length).toEqual(1);

				expect(r[0].toArray()).toEqual([
					{
						option: 'deadline',
						values: {},
					},
					{
						option: 'deadline',
						values: {}
					}
				]);

				const options = r[0].getAll('deadline');

				expect(options[0].expression).toEqual([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 13 }
					}
				]);

				expect(options[1].expression).toEqual([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 18, end: 20 }
					}
				]);
			})
		);
	});

	describe('Standalone option: With value', () => {
		const matcher = optionsValue()
			.option('deadline')
				.value('deadline', dateIntervalValue())
				.phrase('with deadline {deadline}')
				.done()
			.build()
			.matcher(en);

		it('with deadline [partial=false]', () => matcher.match('with deadline jan 12th', { now: new Date(2010, 0, 1) })
			.then(v => {
				expect(v).not.toBeNull();

				const option = v.get('deadline');
				expect(option).not.toBeNull();
				expect(option.option).toEqual('deadline');
				expect(option.values.deadline).toEqual({
					start: { year: 2010, month: 1, dayOfMonth: 12 },
					end: { year: 2010, month: 1, dayOfMonth: 12 }
				});
			})
		);

		it('with deadline [partial=true]', () => matcher.matchPartial('with deadline')
			.then(r => {
				expect(r.length).toEqual(1);

				const option = r[0].get('deadline');
				expect(option).not.toBeNull();
				expect(option.option).toEqual('deadline');
			})
		);
	});

	describe('Single option - no value', () => {
		const queryOptions = optionsValue()
			.option('deadline')
				.phrase('with deadline')
				.done()
			.build();

		const resolver = newPhrases()
			.value('queryOptions', queryOptions)
			.phrase('Things {queryOptions}')
			.toMatcher(en);

		it('Full match', () => {
			return resolver.matchPartial('things with deadline')
				.then(r => {
					expect(r.length).toEqual(1);

					const v = r[0].values.queryOptions.get('deadline');
					expect(v.option).toEqual('deadline');
					expect(v.values).toEqual({});
				});
		});

		it('Partial match', () => {
			return resolver.matchPartial('things with d')
				.then(r => {
					expect(r.length).toEqual(1);

					const v = r[0].values.queryOptions.get('deadline');
					expect(v.option).toEqual('deadline');
					expect(v.values).toEqual({});
				});
		});
	});

	describe('With values', () => {
		const queryOptions = optionsValue()
			.option('deadline')
				.value('deadline', dateIntervalValue())
				.phrase('with deadline {deadline}')
				.phrase('deadline {deadline}')
				.done()
			.option('completed')
				.value('completed', dateIntervalValue())
				.phrase('completed {completed}')
				.done()
			.build();

		const resolver = newPhrases()
			.value('queryOptions', queryOptions)
			.phrase('Things {queryOptions}')
			.toMatcher(en);

		it('Full match', () => {
			return resolver.match('things with deadline jan 12th', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r).not.toBeNull();

					const v = r.values.queryOptions.get('deadline');
					expect(v.option).toEqual('deadline');
					expect(v.values.deadline).toEqual({
						start: { year: 2018, month: 1, dayOfMonth: 12 },
						end: { year: 2018, month: 1, dayOfMonth: 12 }
					});
				});
		});

		it('Multiple options', () => {
			return resolver.match('things with deadline jan 12th and completed today', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r).not.toBeNull();

					const v0 = r.values.queryOptions.get('deadline');
					expect(v0.option).toEqual('deadline');
					expect(v0.values.deadline).toEqual({
						start: { year: 2018, month: 1, dayOfMonth: 12 },
						end: { year: 2018, month: 1, dayOfMonth: 12 }
					});

					const v1 = r.values.queryOptions.get('completed');
					expect(v1.option).toEqual('completed');
					expect(v1.values.completed).toEqual({
						start: { year: 2018, month: 1, dayOfMonth: 2 },
						end: { year: 2018, month: 1, dayOfMonth: 2 }
					});
				});
		});
	});

	describe('With custom values', () => {
		const values = [
			'one',
			'two',
			'three',
			'four five'
		];

		const queryOptions = optionsValue()
			.option('value')
				.value('name', customValue<string>(async function(encounter) {
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
				.phrase('named {name}')
				.done()
			.option('completed')
				.value('completed', dateIntervalValue())
				.phrase('completed {completed}')
				.phrase('c {completed}')
				.done()
			.build();

		const resolver = newPhrases()
			.value('queryOptions', queryOptions)
			.phrase('Things {queryOptions}')
			.toMatcher(en);

		const resolver2 = newPhrases()
			.value('enum', enumerationValue([ 'test', 'abc' ]))
			.value('queryOptions', queryOptions)
			.phrase('{enum} {queryOptions}')
			.toMatcher(en);

		it('Full match', () => {
			return resolver.match('things named one', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r).not.toBeNull();

					const v = r.values.queryOptions.get('value');
					expect(v.option).toEqual('value');
					expect(v.values.name).toEqual('one');
				});
		});

		it('Partial match: thing', () => {
			return resolver.matchPartial('thing', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.length).toEqual(2);

					const v = r[0].values.queryOptions.get('value');
					expect(v.option).toEqual('value');
				});
		});

		it('Partial match: thing com', () => {
			return resolver.matchPartial('thing com', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.length).toEqual(1);

					const v = r[0].values.queryOptions.get('completed');
					expect(v.option).toEqual('completed');
				});
		});

		it('Partial match: thing completed ja', () => {
			return resolver.matchPartial('thing completed ja', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.length).toEqual(1);

					const v = r[0].values.queryOptions.get('completed');
					expect(v.option).toEqual('completed');
				});
		});

		it('Match with enum first', () => {
			return resolver2.match('test named one', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r).not.toBeNull();

					const v = r.values.queryOptions.get('value');
					expect(v.option).toEqual('value');
					expect(v.values.name).toEqual('one');
				});
		});

		it('Partial match with enum first', () => {
			return resolver2.matchPartial('test named one', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.length).toEqual(1);
				});
		});

		it('Partial match with enum first', () => {
			return resolver2.matchPartial('test n', { now: new Date(2018, 0, 2)})
				.then(r => {
					expect(r.length).toEqual(1);

					expect(r[0].values.queryOptions.toArray()).toEqual([
						{
							option: 'value',
							values: {}
						}
					]);
				});
		});

		it('Partial match with enum first', () => {
			return resolver2.matchPartial('test', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.length).toEqual(2);
				});
		});

	});

});
