import { whitespaceTokenizer } from '@ecolect/tokenization';

import { CustomNode } from '../src/CustomNode.js';
import { Encounter } from '../src/matching/Encounter.js';

describe('Encounter', function() {
	describe('next', function() {
		/*
		 * `next` evaluates the outgoing nodes and must leave the encounter as
		 * it found it. Callers such as SubNode measure how many tokens were
		 * consumed against `currentIndex` after `next` has resolved.
		 */
		it('Current index is restored', function() {
			const encounter = new Encounter(whitespaceTokenizer('a , , b'), {});
			encounter.outgoing = [];

			return encounter.next(0, 1)
				.then(() => {
					expect(encounter.currentIndex).toEqual(0);
				});
		});

		it('Current index is restored when punctuation is skipped', function() {
			const encounter = new Encounter(whitespaceTokenizer('a , , b'), {
				skipPunctuation: true
			});
			encounter.outgoing = [];

			return encounter.next(0, 1)
				.then(() => {
					expect(encounter.currentIndex).toEqual(0);
				});
		});

		it('Nodes are evaluated one after the other when one of them is asynchronous', function() {
			const encounter = new Encounter(whitespaceTokenizer('a b'), {});

			const order: string[] = [];
			encounter.outgoing = [
				new CustomNode(() => {
					order.push('first');
					return new Promise(resolve => setTimeout(() => {
						order.push('first done');
						resolve(null);
					}, 5));
				}),
				new CustomNode(() => {
					order.push('second');
					return null;
				})
			];

			return encounter.next(0, 0)
				.then(() => {
					expect(order).toEqual([ 'first', 'first done', 'second' ]);
					expect(encounter.currentIndex).toEqual(0);
				});
		});

		it('Outgoing nodes start after the punctuation that is skipped', function() {
			const encounter = new Encounter(whitespaceTokenizer('a , , b'), {
				skipPunctuation: true
			});

			let indexSeenByNode = -1;
			encounter.outgoing = [
				new CustomNode(() => {
					indexSeenByNode = encounter.currentIndex;
					return null;
				})
			];

			return encounter.next(0, 1)
				.then(() => {
					// Tokens are `a` `,` `,` `b`, so the node starts at `b`
					expect(indexSeenByNode).toEqual(3);
				});
		});
	});

	describe('previousNonSkipped', function() {
		it('Looks backwards from the given index', function() {
			const encounter = new Encounter(whitespaceTokenizer('a , , b'), {
				skipPunctuation: true
			});

			// Tokens are `a` `,` `,` `b`, index 3 is just after the punctuation
			expect(encounter.previousNonSkipped(3)).toEqual(1);
			expect(encounter.previousNonSkipped(4)).toEqual(4);
		});

		it('Returns the index as is when punctuation is not skipped', function() {
			const encounter = new Encounter(whitespaceTokenizer('a , , b'), {});

			expect(encounter.previousNonSkipped(3)).toEqual(3);
		});
	});
});
