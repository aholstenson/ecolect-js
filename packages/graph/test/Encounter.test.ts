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
});
