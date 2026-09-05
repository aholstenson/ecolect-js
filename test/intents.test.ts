import { IntentsBuilder } from '../src/IntentsBuilder.js';
import { en } from '../src/language/en/index.js';
import { newPhrases } from '../src/resolver/newPhrases.js';
import { anyTextValue, customValue } from '../src/values/index.js';

import { assertNotNull } from './assertions.js';

describe('Intents', function() {
	describe('Orders', function() {
		const intents = new IntentsBuilder(en)
			.add('orders', newPhrases()
				.phrase('Orders')
				.phrase('Show orders')
				.build()
			)
			.add('orders:active', newPhrases()
				.phrase('Orders that are active')
				.phrase('Show orders that are active')
				.build()
			)
			.add('customer:orders', newPhrases()
				.value('customer', anyTextValue())
				.phrase('Orders for {customer}')
				.phrase('Find orders for {customer}')
				.phrase('Show orders for {customer}')
				.build()
			)
			.add('employee:assignments', newPhrases()
				.value('employee', anyTextValue())
				.phrase('Assignments for {employee}')
				.build()
			)
			.build();

		it('Match: orders', function() {
			return intents.match('orders')
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('orders');
				});
		});

		it('Match: score of orders is above zero', function() {
			return intents.match('orders')
				.then(r => {
					assertNotNull(r);
					expect(r.score).toBeGreaterThan(0);
				});
		});

		it('Partial: scores are above zero and in descending order', function() {
			return intents.matchPartial('orders')
				.then(r => {
					const scores = r.map(m => m.score);

					expect(scores.length).toBeGreaterThan(1);
					expect(scores.every(score => score > 0)).toBe(true);
					expect([ ...scores ].sort((a, b) => b - a)).toEqual(scores);
				});
		});

		it('Match (skippable in input): show for orders', function() {
			return intents.match('show for orders', { fuzzy: true })
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('orders');
				});
		});

		it('Match (skippable in expression): orders Test', function() {
			// Test that skipping `for` works fine
			return intents.match('orders Test')
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('customer:orders');
				});
		});

		it('No match: show', function() {
			return intents.match('show')
				.then(r => {
					expect(r).toBeNull();
				});
		});

		it('Partial: orders', function() {
			return intents.matchPartial('orders')
				.then(r => {
					expect(r.length).toEqual(3);
				});
		});

		it('Partial: or', function() {
			return intents.matchPartial('or')
				.then(r => {
					expect(r.length).toEqual(3);
				});
		});

		it('Partial: show orders', function() {
			return intents.matchPartial('show orders')
				.then(r => {
					expect(r.length).toEqual(3);
				});
		});

		it('Partial: sh order', function() {
			return intents.matchPartial('sh order')
				.then(r => {
					expect(r.length).toEqual(0);
				});
		});

		it('Partial: orders for', function() {
			return intents.matchPartial('orders for')
				.then(r => {
					expect(r.length).toEqual(1);
					expect(r[0].id).toEqual('customer:orders');
				});
		});

		it('Partial: orders for Test', function() {
			return intents.matchPartial('orders for Test')
				.then(r => {
					expect(r.length).toEqual(1);
					expect(r[0].id).toEqual('customer:orders');

					if(r[0].id === 'customer:orders') {
						expect(r[0].values.customer).toEqual('Test');
					}
				});
		});

		it('Partial (with skippable): orders Test', function() {
			return intents.matchPartial('orders Test')
				.then(r => {
					expect(r.length).toEqual(1);
					expect(r[0].id).toEqual('customer:orders');

					if(r[0].id === 'customer:orders') {
						expect(r[0].values.customer).toEqual('Test');
					}
				});
		});

		it('Partial and fuzzy: orders for Test', function() {
			return intents.matchPartial('o Test', { fuzzy: true })
				.then(r => {
					expect(r.length).toEqual(1);
					expect(r[0].id).toEqual('customer:orders');

					if(r[0].id === 'customer:orders') {
						expect(r[0].values.customer).toEqual('Test');
					}
				});
		});

		it('Partial: assign', function() {
			return intents.matchPartial('assign')
				.then(r => {
					expect(r.length).toEqual(1);
				});
		});

		it('Partial: assignments', function() {
			return intents.matchPartial('assignments')
				.then(r => {
					expect(r.length).toEqual(1);
				});
		});
	});

	describe('Matching everything', function() {
		const intents = new IntentsBuilder(en)
			.add('orders', newPhrases()
				.phrase('Orders')
				.phrase('Show orders')
				.build()
			)
			.add('customer:orders', newPhrases()
				.value('customer', anyTextValue())
				.phrase('Orders for {customer}')
				.phrase('Find orders for {customer}')
				.build()
			)
			.add('search', newPhrases()
				.value('query', anyTextValue())
				.phrase('Find {query}')
				.build()
			)
			.build();

		it('Every intent that matches the expression is returned', function() {
			return intents.matchAll('find orders for Test')
				.then(r => {
					expect(r.map(m => m.id)).toEqual([ 'customer:orders', 'search' ]);

					const [ first, second ] = r;
					if(first.id === 'customer:orders') {
						expect(first.values.customer).toEqual('Test');
					}

					if(second.id === 'search') {
						expect(second.values.query).toEqual('orders for Test');
					}
				});
		});

		it('Scores are above zero and in descending order', function() {
			return intents.matchAll('find orders for Test')
				.then(r => {
					const scores = r.map(m => m.score);

					expect(scores.length).toBeGreaterThan(1);
					expect(scores.every(score => score > 0)).toBe(true);
					expect([ ...scores ].sort((a, b) => b - a)).toEqual(scores);
				});
		});

		it('Intent matched by several phrases is returned once', function() {
			return intents.matchAll('show orders')
				.then(r => {
					expect(r.map(m => m.id)).toEqual([ 'orders' ]);
				});
		});

		it('Intents that need more of the expression are left out', function() {
			return intents.matchAll('orders')
				.then(r => {
					expect(r.map(m => m.id)).toEqual([ 'orders' ]);
				});
		});

		it('No match: find', function() {
			return intents.matchAll('find')
				.then(r => {
					expect(r).toEqual([]);
				});
		});

		it('Limit keeps the best matches', function() {
			return intents.matchAll('find orders for Test', { limit: 1 })
				.then(r => {
					expect(r.map(m => m.id)).toEqual([ 'customer:orders' ]);
				});
		});
	});

	describe('Scoring with values', function() {
		const phrases = newPhrases()
			.value('text', anyTextValue())
			.phrase('add {text}')
			.phrase('add {text} to my list')
			.build();

		const intents = new IntentsBuilder(en)
			.add('add', phrases)
			.build();

		const direct = phrases.toMatcher(en);

		it('Intent scores like the phrases do', function() {
			const expression = 'add milk to my list';
			return Promise.all([ intents.match(expression), direct.match(expression) ])
				.then(([ intent, phrase ]) => {
					assertNotNull(intent);
					assertNotNull(phrase);

					// The intent adds a small penalty for the nested graph
					expect(intent.score).toBeCloseTo(phrase.score, 2);
					expect(intent.values.text).toEqual('milk');
				});
		});

		it('Phrase matching more of the expression wins', function() {
			return intents.match('add milk to my list')
				.then(r => {
					assertNotNull(r);
					expect(r.values.text).toEqual('milk');
				});
		});

		it('Partial matches are ordered by how much they match', function() {
			return intents.matchPartial('add milk to my')
				.then(r => {
					expect(r.length).toBeGreaterThan(1);
					expect(r[0].values.text).toEqual('milk');

					const scores = r.map(m => m.score);
					expect([ ...scores ].sort((a, b) => b - a)).toEqual(scores);
					expect(scores[0]).toBeGreaterThan(scores[scores.length - 1]);
				});
		});
	});

	describe('Concurrent matching', function() {
		const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

		// Value that takes a while, so that several matches are in flight at once
		const slow = customValue<string>(async encounter => {
			await wait(5);
			if(encounter.text === 'alpha' || encounter.text === 'beta') {
				encounter.match(encounter.text);
			}
		});

		const intents = new IntentsBuilder(en)
			.add('run', newPhrases()
				.value('v', slow)
				.phrase('run {v}')
				.phrase('run {v} now')
				.build()
			)
			.add('stop', newPhrases()
				.phrase('stop')
				.build()
			)
			.build();

		it('Matches in flight at the same time do not affect each other', function() {
			return Promise.all([
				intents.match('run alpha now'),
				intents.match('run beta'),
				intents.match('stop')
			]).then(([ a, b, c ]) => {
				assertNotNull(a);
				expect(a.id).toEqual('run');
				if(a.id === 'run') {
					expect(a.values.v).toEqual('alpha');
				}

				assertNotNull(b);
				expect(b.id).toEqual('run');
				if(b.id === 'run') {
					expect(b.values.v).toEqual('beta');
				}

				assertNotNull(c);
				expect(c.id).toEqual('stop');
			});
		});
	});
});
