import { whitespaceTokenizer, TokenComparer } from '@ecolect/tokenization';

import { GraphOptions } from '../src/GraphOptions.js';
import { Node } from '../src/Node.js';
import { SubNode } from '../src/SubNode.js';
import { TokenNode } from '../src/TokenNode.js';

const comparer: TokenComparer = {
	compare: (a, b) => a.normalized === b.normalized ? 1 : 0,
	comparePartial: (a, b) => a.normalized.indexOf(b.normalized) === 0 ? 1 : 0
};

const options: GraphOptions = {};

/**
 * Create a node that matches the given text.
 *
 * @param text -
 *   the text the node should match
 * @returns
 *   node matching the text
 */
function node(text: string): Node {
	return new TokenNode(comparer, whitespaceTokenizer(text)[0]);
}

describe('SubNode', function() {
	describe('equals', function() {
		const hello = node('hello');
		const world = node('world');

		it('Same roots', function() {
			const roots = [ hello ];

			expect(new SubNode(roots, options).equals(new SubNode(roots, options)))
				.toBe(true);
		});

		it('Same roots in different arrays', function() {
			expect(new SubNode([ hello ], options).equals(new SubNode([ hello ], options)))
				.toBe(true);
		});

		it('Different roots', function() {
			expect(new SubNode([ hello ], options).equals(new SubNode([ world ], options)))
				.toBe(false);
		});

		it('Different number of roots', function() {
			expect(new SubNode([ hello ], options).equals(new SubNode([ hello, world ], options)))
				.toBe(false);
		});

		it('Different filters', function() {
			const roots = [ hello ];

			expect(new SubNode(roots, options, () => true)
				.equals(new SubNode(roots, options, () => true)))
				.toBe(false);
		});

		it('Not a SubNode', function() {
			expect(new SubNode([ hello ], options).equals(world)).toBe(false);
		});
	});
});
