import type { Node } from '../src/graph/index.js';
import { intentsBuilder } from '../src/index.js';
import { en } from '../src/language/en/index.js';
import { newPhrases } from '../src/resolver/newPhrases.js';
import type { PhraseSegment } from '../src/resolver/phraseSyntax.js';
import { parsePhraseSyntax } from '../src/resolver/phraseSyntax.js';
import { anyTextValue, dateIntervalValue, enumerationValue } from '../src/values/index.js';

import { assertNotNull } from './assertions.js';
import { expectGrowth } from './growth.js';

describe('Phrases: Groups of alternatives', function() {
	/**
	 * Create the expected part of a phrase.
	 *
	 * @param alternatives -
	 *   the texts the part can be
	 * @param optional -
	 *   if the part can be left out
	 * @returns
	 *   the part
	 */
	function part(alternatives: string[], optional = false): PhraseSegment {
		return { alternatives, optional };
	}

	describe('parsePhraseSyntax', function() {
		it('Phrase without groups', function() {
			expect(parsePhraseSyntax('show orders')).toEqual([ part([ 'show orders' ]) ]);
		});

		it('Group that must match', function() {
			expect(parsePhraseSyntax('orders (from|in) {when}')).toEqual([
				part([ 'orders' ]),
				part([ 'from', 'in' ]),
				part([ '{when}' ])
			]);
		});

		it('Group that may be left out', function() {
			expect(parsePhraseSyntax('[show|list] orders')).toEqual([
				part([ 'show', 'list' ], true),
				part([ 'orders' ])
			]);
		});

		it('Several groups', function() {
			expect(parsePhraseSyntax('[show|list] orders (from|in) {when}')).toEqual([
				part([ 'show', 'list' ], true),
				part([ 'orders' ]),
				part([ 'from', 'in' ]),
				part([ '{when}' ])
			]);
		});

		it('Group within a word', function() {
			expect(parsePhraseSyntax('order[s]')).toEqual([ part([ 'orders', 'order' ]) ]);
		});

		it('Several groups within a word', function() {
			expect(parsePhraseSyntax('(re|un)do[es]')).toEqual([
				part([ 'redoes', 'redo', 'undoes', 'undo' ])
			]);
		});

		it('Alternative with several words', function() {
			expect(parsePhraseSyntax('orders (for|belonging to) {customer}')).toEqual([
				part([ 'orders' ]),
				part([ 'for', 'belonging to' ]),
				part([ '{customer}' ])
			]);
		});

		it('Alternative that is a value', function() {
			expect(parsePhraseSyntax('orders (today|{when})')).toEqual([
				part([ 'orders' ]),
				part([ 'today', '{when}' ])
			]);
		});

		it('Alternatives that are the same are read once', function() {
			expect(parsePhraseSyntax('[show|show] orders')).toEqual([
				part([ 'show' ], true),
				part([ 'orders' ])
			]);
		});

		it('Group at the end that may be left out', function() {
			expect(parsePhraseSyntax('show orders [now]')).toEqual([
				part([ 'show orders' ]),
				part([ 'now' ], true)
			]);
		});

		it('Group that is never closed', function() {
			expect(() => parsePhraseSyntax('[show orders')).toThrow(/never closed/);
		});

		it('Closing character without a group', function() {
			expect(() => parsePhraseSyntax('show orders)')).toThrow(/no group has been opened/);
		});

		it('Nested groups', function() {
			expect(() => parsePhraseSyntax('([show|list]) orders')).toThrow(/nested/);
		});

		it('Separator outside a group', function() {
			expect(() => parsePhraseSyntax('on | off')).toThrow(/\|/);
		});

		it('Empty alternative in a group that must match', function() {
			expect(() => parsePhraseSyntax('a (|b)')).toThrow(/empty alternative/);
		});
	});

	describe('Phrases that are not valid', function() {
		it('Phrase without anything to match', function() {
			expect(() => newPhrases()
				.phrase('[]')
				.toMatcher(en)
			).toThrow(/does not contain anything to match/);
		});

		it('Value that a path has two times', function() {
			expect(() => newPhrases()
				.value('a', anyTextValue())
				.phrase('[{a}] to {a}')
				.toMatcher(en)
			).toThrow(/`\{a\}` is used more than once in `\[\{a\}\] to \{a\}`/);
		});

		it('Value in alternatives of the same group', function() {
			const matcher = newPhrases()
				.value('a', anyTextValue())
				.phrase('orders (for {a}|by {a})')
				.toMatcher(en);

			return matcher.match('orders by acme')
				.then(r => {
					assertNotNull(r);
					expect(r.values).toEqual({ a: 'acme' });
				});
		});
	});

	describe('Matcher', function() {
		const matcher = newPhrases()
			.value('when', dateIntervalValue())
			.phrase('[show|list] orders (from|in) {when}')
			.toMatcher(en);

		const options = { now: new Date(2020, 0, 1) };

		it('First alternative of both groups', function() {
			return matcher.match('show orders from today', options)
				.then(r => assertNotNull(r));
		});

		it('Second alternative of both groups', function() {
			return matcher.match('list orders in today', options)
				.then(r => assertNotNull(r));
		});

		it('Group that may be left out is left out', function() {
			return matcher.match('orders from today', options)
				.then(r => assertNotNull(r));
		});

		it('Word that is not an alternative', function() {
			return matcher.match('display orders from today', options)
				.then(r => expect(r).toBeNull());
		});

		it('Value is captured', function() {
			return matcher.match('list orders in 2020', options)
				.then(r => {
					assertNotNull(r);
					expect(r.values.when).not.toBeUndefined();
				});
		});
	});

	describe('Many groups that may be left out', function() {
		/**
		 * Create a phrase with the given number of words that may be left out.
		 *
		 * @param count -
		 *   the number of groups
		 * @returns
		 *   the phrase
		 */
		function optionalWords(count: number) {
			return Array.from({ length: count }, (_, i) => '[w' + i + ']').join(' ') + ' end';
		}

		it('Matcher is built in reasonable time', async function() {
			const matcher = newPhrases()
				.phrase(optionalWords(12))
				.toMatcher(en);

			assertNotNull(await matcher.match('w3 end'));

			// Each group doubles the ways to write the phrase
			await expectGrowth(
				async size => {
					const phrases = newPhrases()
						.phrase('start ' + optionalWords(size))
						.build();

					const m = phrases.toMatcher(en);
					await m.match('start w3 w7 w9 end');
					await m.matchPartial('start w3');
					await phrases.toGenerator(en).generateAll({});
				},
				{ from: 10, to: 40, degree: 2 }
			);
		});

		it('Graph grows with the words and not with the ways to write the phrase', function() {
			const graph = newPhrases()
				.phrase(optionalWords(12))
				.build()
				.toGraph(en);

			const nodes = new Set<Node>();
			const visit = (list: Node[]) => {
				for(const node of list) {
					if(nodes.has(node)) continue;
					nodes.add(node);
					visit(node.outgoing);
				}
			};
			visit(graph.nodes);

			/*
			 * Each `wN` is the two tokens `w` and `N`, then comes `end` and the
			 * collector. Expanded into its 4096 ways the phrase used more
			 * than 10000 nodes.
			 */
			expect(nodes.size).toEqual((12 * 2) + 2);
		});

		it('Phrase that can be written in very many ways works', async function() {
			const phrases = newPhrases()
				.phrase('start ' + optionalWords(40))
				.build();

			const matcher = phrases.toMatcher(en);
			assertNotNull(await matcher.match('start w3 w17 w39 end'));
			expect(await matcher.match('start w17 w3 end')).toBeNull();

			const partial = await matcher.matchPartial('start w3');
			expect(partial.length).toBe(1);

			// The shortest ways to write it come first, `w0` is written as two words
			const generator = phrases.toGenerator(en);
			const texts = await generator.generateAll({});
			expect(texts[0]).toEqual('start end');
			expect(texts[1]).toEqual('start w 0 end');
		});

		it('Parts with an item that is not text between them can have many groups', async function() {
			const matcher = newPhrases()
				.phrase(optionalWords(16), /^x$/, optionalWords(16))
				.toMatcher(en);

			assertNotNull(await matcher.match('w1 end x w2 end'));
		});

		it('Word that can be written in too many ways is reported', function() {
			const glued = 'w' + Array.from({ length: 13 }, (_, i) => '[a' + i + '|b' + i + ']').join('');
			expect(() => newPhrases()
				.phrase(glued)
				.toMatcher(en)
			).toThrow(/can be written in more than 4096 ways/);
		});
	});

	describe('Groups next to an item that is not text', function() {
		const matcher = newPhrases()
			.phrase('[show] order[s]', /^[0-9]+$/, '[now]')
			.toMatcher(en);

		it('Groups are left out', function() {
			return matcher.match('order 12 now')
				.then(r => assertNotNull(r));
		});

		it('Text item with only groups is not left out', function() {
			// Each text item of a phrase must read something
			return matcher.match('order 12')
				.then(r => expect(r).toBeNull());
		});

		it('Groups are given', function() {
			return matcher.match('show orders 12 now')
				.then(r => assertNotNull(r));
		});

		it('Item that is not text is left out', function() {
			return matcher.match('orders now')
				.then(r => expect(r).toBeNull());
		});
	});

	describe('Groups and words that may be skipped', function() {
		const matcher = newPhrases()
			.value('color', enumerationValue([ 'red', 'blue' ]))
			.skippable('please')
			.phrase('[show] orders [please] {color}')
			.toMatcher(en);

		it('Partial match after a skipped word suggests every value', function() {
			return matcher.matchPartial('orders please')
				.then(r => expect(r.map(m => m.values.color)).toEqual([ 'red', 'blue' ]));
		});

		it('Partial match after a group suggests every value', function() {
			// The first match continues with `please` and has no color yet
			return matcher.matchPartial('show orders')
				.then(r => expect(r.map(m => m.values.color)).toEqual([ undefined, 'red', 'blue' ]));
		});
	});

	describe('Group that must match', function() {
		const matcher = newPhrases()
			.phrase('orders (open|closed)')
			.toMatcher(en);

		it('Alternative is given', function() {
			return matcher.match('orders closed')
				.then(r => assertNotNull(r));
		});

		it('Group is left out', function() {
			return matcher.match('orders')
				.then(r => expect(r).toBeNull());
		});
	});

	describe('Matching everything', function() {
		it('Alternatives that resolve the same values are reported once', function() {
			const matcher = newPhrases()
				.value('customer', anyTextValue())
				.phrase('[show|list] orders for {customer}')
				.toMatcher(en);

			return matcher.matchAll('orders for Test')
				.then(r => {
					expect(r.length).toEqual(1);
					expect(r[0].values).toEqual({ customer: 'Test' });
				});
		});
	});

	describe('Alternatives with values of the same type', function() {
		const matcher = newPhrases()
			.value('author', anyTextValue())
			.value('publisher', anyTextValue())
			.phrase('books (by {author}|by {publisher} press)')
			.toMatcher(en);

		it('Value is captured under the name of its alternative', function() {
			return matcher.match('books by acme press')
				.then(r => {
					assertNotNull(r);
					expect(r.values).toEqual({ publisher: 'acme' });
				});
		});
	});

	describe('Intents', function() {
		const matcher = intentsBuilder(en)
			.add('orders', newPhrases()
				.phrase('[show|list] orders')
				.build()
			)
			.build();

		it('Intent matches an alternative', function() {
			return matcher.match('list orders')
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('orders');
				});
		});

		it('Intent matches without the group', function() {
			return matcher.match('orders')
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('orders');
				});
		});
	});
});
