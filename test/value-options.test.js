import { expect } from 'chai';

import lang from '../src/language/en';
import Builder from '../src/resolver/builder';

import { options, dateInterval, enumeration } from '../src/values';

describe('Value: Options', function() {

	describe('Standalone option: No values', () => {
		const matcher = options()
			.option('deadline')
				.add('with deadline')
				.done()
			.build()
			.matcher(lang);

		it('with deadline [partial=false]', () => matcher('with deadline')
			.then(v => {
				expect(v).to.deep.equal([
					{
						option: 'deadline',
						values: {},
					}
				]);

				expect(v[0].expression).to.deep.equal([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 13 }
					}
				]);
			})
		);

		it('with deadline [partial=true]', () => matcher('with deadline', { partial: true })
			.then(v => {
				expect(v).to.deep.equal([
					{
						option: 'deadline',
						values: {},
					}
				]);

				expect(v[0].expression).to.deep.equal([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 13 }
					}
				]);
			})
		);

		it('with [partial=true]', () => matcher('with', { partial: true })
			.then(v => {
				expect(v).to.deep.equal([
					{
						option: 'deadline',
						values: {},
					}
				]);

				expect(v[0].expression).to.deep.equal([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 4 }
					}
				]);
			})
		);

		it('with d [partial=true]', () => matcher('with d', { partial: true })
			.then(v => {
				expect(v).to.deep.equal([
					{
						option: 'deadline',
						values: {},
					}
				]);

				expect(v[0].expression).to.deep.equal([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 6 }
					}
				]);
			})
		);

		it('with deadline and wi [partial=true]', () => matcher('with deadline and wi', { partial: true })
			.then(v => {
				expect(v).to.deep.equal([
					{
						option: 'deadline',
						values: {},
					},
					{
						option: 'deadline',
						values: {}
					}
				]);

				expect(v[0].expression).to.deep.equal([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 13 }
					}
				]);

				expect(v[1].expression).to.deep.equal([
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
		const matcher = options()
			.option('deadline')
				.value('deadline', dateInterval())
				.add('with deadline {deadline}')
				.done()
			.build()
			.matcher(lang);

		it('with deadline [partial=false]', () => matcher('with deadline jan 12th', { now: new Date(2010, 0, 1) })
			.then(v => {
				expect(v).to.not.be.null;
				expect(v.length).to.equal(1);

				const a = v[0];
				expect(a.option).to.equal('deadline');
				expect(a.values.deadline).to.deep.equal({
					start: { period: 'day', year: 2010, month: 0, day: 12 },
					end: { period: 'day', year: 2010, month: 0, day: 12 }
				});
			})
		);

		it('with deadline [partial=true]', () => matcher('with deadline', { partial: true })
			.then(v => {
				expect(v).to.not.be.null;
				expect(v.length).to.equal(1);

			})
		);
	});

	describe('Single option - no value', () => {
		const queryOptions = options()
			.option('deadline')
				.add('with deadline')
				.done()
			.build();

		const resolver = new Builder(lang)
			.value('queryOptions', queryOptions)
			.add('Things {queryOptions}')
			.build();

		it('Full match', () => {
			return resolver.match('things with deadline', { partial: false })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.queryOptions).to.be.instanceOf(Array);

					const v = r.best.values.queryOptions[0];
					expect(v.option).to.equal('deadline');
					expect(v.values).to.deep.equal({});
				});
		});

		it('Partial match', () => {
			return resolver.match('things with d', { partial: true })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.queryOptions).to.be.instanceOf(Array);

					const v = r.best.values.queryOptions[0];
					expect(v.option).to.equal('deadline');
					expect(v.values).to.deep.equal({});
				});
		});
	});

	describe('With values', () => {
		const queryOptions = options({ min: 1 })
			.option('deadline')
				.value('deadline', dateInterval())
				.add('with deadline {deadline}')
				.add('deadline {deadline}')
				.done()
			.option('completed')
				.value('completed', dateInterval())
				.add('completed {completed}')
				.done()
			.build();

		const resolver = new Builder(lang)
			.value('queryOptions', queryOptions)
			.add('Things {queryOptions}')
			.build();

		it('Full match', () => {
			return resolver.match('things with deadline jan 12th', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.queryOptions).to.be.instanceOf(Array);

					const v = r.best.values.queryOptions[0];
					expect(v.option).to.equal('deadline');
					expect(v.values).to.deep.equal({
						deadline: {
							start: { period: 'day', year: 2018, month: 0, day: 12 },
							end: { period: 'day', year: 2018, month: 0, day: 12 }
						}
					});
				});
		});

		it('Multiple options', () => {
			return resolver.match('things with deadline jan 12th and completed today', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.queryOptions).to.be.instanceOf(Array);

					const v0 = r.best.values.queryOptions[0];
					expect(v0.option).to.equal('deadline');
					expect(v0.values).to.deep.equal({
						deadline: {
							start: { period: 'day', year: 2018, month: 0, day: 12 },
							end: { period: 'day', year: 2018, month: 0, day: 12 }
						}
					});

					const v1 = r.best.values.queryOptions[1];
					expect(v1.option).to.equal('completed');
					expect(v1.values).to.deep.equal({
						completed: {
							start: { period: 'day', year: 2018, month: 0, day: 2 },
							end: { period: 'day', year: 2018, month: 0, day: 2 }
						}
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

		const queryOptions = options({ min: 1 })
			.option('value')
				.value('name', function(encounter) {
					let text = encounter.text();
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
				})
				.add('named {name}')
				.done()
			.option('completed')
				.value('completed', dateInterval())
				.add('completed {completed}')
				.add('c {completed}')
				.done()
			.build();

		const resolver = new Builder(lang)
			.value('queryOptions', queryOptions)
			.add('Things {queryOptions}')
			.build();

		const resolver2 = new Builder(lang)
			.value('enum', enumeration([ 'test', 'abc' ]))
			.value('queryOptions', queryOptions)
			.add('{enum} {queryOptions}')
			.build();

		it('Full match', () => {
			return resolver.match('things named one', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.queryOptions).to.be.instanceOf(Array);

					const v = r.best.values.queryOptions[0];
					expect(v.option).to.equal('value');
					expect(v.values).to.deep.equal({
						name: 'one'
					});
				});
		});

		it('Partial match: thing', () => {
			return resolver.match('thing', { partial: true, now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.queryOptions).to.be.instanceOf(Array);

					const v = r.best.values.queryOptions[0];
					expect(v.option).to.equal('value');

					const v2 = r.matches[1].values.queryOptions[0];
					expect(v2.option).to.equal('completed');
				});
		});

		it('Partial match: thing com', () => {
			return resolver.match('thing com', { partial: true, now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.queryOptions).to.be.instanceOf(Array);

					const v = r.best.values.queryOptions[0];
					expect(v.option).to.equal('completed');
				});
		});

		it('Partial match: thing completed ja', () => {
			return resolver.match('thing completed ja', { partial: true, now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.queryOptions).to.be.instanceOf(Array);

					const v = r.best.values.queryOptions[0];
					expect(v.option).to.equal('completed');
				});
		});

		it('Match with enum first', () => {
			return resolver2.match('test named one', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.queryOptions).to.be.instanceOf(Array);

					const v = r.best.values.queryOptions[0];
					expect(v.option).to.equal('value');
					expect(v.values).to.deep.equal({
						name: 'one'
					});
				});
		});

		it('Partial match with enum first', () => {
			return resolver2.match('test named one', { now: new Date(2018, 0, 2), partial: true })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.matches.length).to.equal(1);
				});
		});

		it('Partial match with enum first', () => {
			return resolver2.match('test n', { now: new Date(2018, 0, 2), partial: true })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.matches.length).to.equal(1);

					expect(r.best.values.queryOptions).to.deep.equal([
						{
							option: 'value',
							values: {}
						}
					]);
				});
		});

		it('Partial match with enum first', () => {
			return resolver2.match('test', { now: new Date(2018, 0, 2), partial: true })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.matches.length).to.equal(2);
				});
		});

	});

});
