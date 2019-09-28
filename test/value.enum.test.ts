import { en } from '../src/language/en';
import { ResolverBuilder } from '../src/resolver/builder';

import { enumerationValue } from '../src/values';

describe('Value: Enumeration', function() {
	describe('No mapping', function() {
		const resolver = new ResolverBuilder(en)
			.value('company', enumerationValue([ 'Balloons', 'Cookie Co', 'Banana Inc' ]))
			.add('{company} orders')
			.add('orders for {company}')
			.build();

		it('Invalid company', function() {
			return resolver.match('orders for ABC')
				.then(results => {
					expect(results.matches.length).toEqual(0);
				});
		});

		it('Single token company', function() {
			return resolver.match('orders for Ballons')
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('company')).toEqual('Balloons');
				});
		});

		it('Multi token company', function() {
			return resolver.match('orders for Cookie Co')
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('company')).toEqual('Cookie Co');
				});
		});
	});

	describe('Mapping', function() {
		const resolver = new ResolverBuilder(en)
			.value('company', enumerationValue([
				{ name: 'Balloons' },
				{ name: 'Cookie Co' },
				{ name: 'Banana Inc' }
			], v => v.name))
			.add('{company} orders')
			.add('orders for {company}')
			.build();

		it('Invalid company', function() {
			return resolver.match('orders for ABC')
				.then(results => {
					expect(results.matches.length).toEqual(0);
				});
		});

		it('Single token company', function() {
			return resolver.match('orders for Ballons')
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('company')).toEqual({
						name: 'Balloons'
					});
				});
		});

		it('Multi token company', function() {
			return resolver.match('orders for Cookie Co')
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('company')).toEqual({
						name: 'Cookie Co'
					});
				});
		});
	});

	describe('Partial matching', function() {
		const resolver = new ResolverBuilder(en)
			.value('company', enumerationValue([ 'Balloons', 'Cookie Co', 'Banana Inc' ]))
			.add('{company} orders')
			.add('orders for {company}')
			.build();


		it('Single token', function() {
			return resolver.match('orders ', { partial: true })
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('company')).toBeUndefined();
				});
		});

		it('At start of value', function() {
			return resolver.match('orders for ', { partial: true })
				.then(results => {
					// Expect all of the matches when at the start of the value
					expect(results.matches.length).toEqual(3);
				});
		});

		it.only('Typing `B`', function() {
			return resolver.match('orders for b', { partial: true })
				.then(results => {
					expect(results.matches.length).toEqual(2);
				});
		});

		it('Invalid company', function() {
			return resolver.match('orders for A', {
				partial: true
			})
				.then(results => {
					expect(results.matches.length).toEqual(0);
				});
		});

		it('One match', function() {
			return resolver.match('orders for C', {
				partial: true
			})
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('company')).toEqual('Cookie Co');

					const expr = results.best.expression;
					expect(expr[expr.length - 1]).toEqual({
						type: 'value',
						id: 'company',
						value: 'Cookie Co',

						source: {
							start: 11,
							end: 12
						}
					});
				});
		});
	});
});