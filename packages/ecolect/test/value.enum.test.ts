import { en } from '@ecolect/language-en';

import { newPhrases } from '../src/resolver/newPhrases.js';
import { enumerationValue } from '../src/values/index.js';

import { assertNotNull } from './assertions.js';

describe('Value: Enumeration', function() {
	describe('No mapping', function() {
		const resolver = newPhrases()
			.value('company', enumerationValue([ 'Balloons', 'Cookie Co', 'Banana Inc' ]))
			.phrase('{company} orders')
			.phrase('orders for {company}')
			.toMatcher(en);

		it('Invalid company', function() {
			return resolver.match('orders for ABC')
				.then(r => {
					expect(r).toBeNull();
				});
		});

		it('Single token company', function() {
			return resolver.match('orders for Ballons')
				.then(r => {
					assertNotNull(r);
					expect(r.values.company).toEqual('Balloons');
				});
		});

		it('Multi token company', function() {
			return resolver.match('orders for Cookie Co')
				.then(r => {
					assertNotNull(r);
					expect(r.values.company).toEqual('Cookie Co');
				});
		});
	});

	describe('Mapping', function() {
		const resolver = newPhrases()
			.value('company', enumerationValue([
				{ name: 'Balloons' },
				{ name: 'Cookie Co' },
				{ name: 'Banana Inc' }
			], v => v.name))
			.phrase('{company} orders')
			.phrase('orders for {company}')
			.toMatcher(en);

		it('Invalid company', function() {
			return resolver.match('orders for ABC')
				.then(r => {
					expect(r).toBeNull();
				});
		});

		it('Single token company', function() {
			return resolver.match('orders for Ballons')
				.then(r => {
					assertNotNull(r);
					expect(r.values.company).toEqual({
						name: 'Balloons'
					});
				});
		});

		it('Multi token company', function() {
			return resolver.match('orders for Cookie Co')
				.then(r => {
					assertNotNull(r);
					expect(r.values.company).toEqual({
						name: 'Cookie Co'
					});
				});
		});
	});

	describe('Partial matching', function() {
		const resolver = newPhrases()
			.value('company', enumerationValue([ 'Balloons', 'Cookie Co', 'Banana Inc' ]))
			.phrase('{company} orders')
			.phrase('orders for {company}')
			.toMatcher(en);

		it('Single token', function() {
			return resolver.matchPartial('orders ')
				.then(r => {
					expect(r.length).toEqual(1);

					const match = r[0];
					assertNotNull(match);
					expect(match.values.company).toBeUndefined();
				});
		});

		it('At start of value', function() {
			return resolver.matchPartial('orders for ')
				.then(r => {
					expect(r.length).toEqual(3);
				});
		});

		it('Typing `B`', function() {
			return resolver.matchPartial('orders for b')
				.then(r => {
					expect(r.length).toEqual(2);
				});
		});

		it('Invalid company', function() {
			return resolver.matchPartial('orders for A')
				.then(r => {
					expect(r.length).toEqual(0);
				});
		});

		it('One match', function() {
			return resolver.matchPartial('orders for C')
				.then(r => {
					expect(r.length).toEqual(1);

					const match = r[0];
					assertNotNull(match);
					expect(match.values.company).toEqual('Cookie Co');

					const expr = match.expression;
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
