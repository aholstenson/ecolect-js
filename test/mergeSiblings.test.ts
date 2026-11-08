import type { GraphTokens } from '../src/graph/GraphBuilder.js';
import { mergeSiblings } from '../src/graph/mergeSiblings.js';
import type { Node } from '../src/graph/Node.js';
import { TokenNode } from '../src/graph/TokenNode.js';
import { en } from '../src/language/en/index.js';
import { newPhrases } from '../src/resolver/newPhrases.js';
import { whitespaceTokenizer } from '../src/tokenization/index.js';

const tokens: GraphTokens = {
	tokenizer: whitespaceTokenizer,
	tokenComparer: {
		compare(a, b) {
			return a.normalized === b.normalized ? 1 : 0;
		},

		comparePartial(a, b) {
			return a.normalized.indexOf(b.normalized) === 0 ? 1 : 0;
		}
	}
};

/**
 * Create a token node.
 *
 * @param raw -
 *   the word
 * @param knownTokens -
 *   the words of the graph of the node
 * @returns
 *   the node
 */
function token(raw: string, knownTokens: Set<string>): TokenNode {
	return new TokenNode(tokens.tokenComparer, whitespaceTokenizer(raw)[0], knownTokens);
}

describe('mergeSiblings', function() {
	it('Merges roots with the same word', function() {
		const known = new Set<string>();
		const a1 = token('a', known);
		const a2 = token('a', known);
		const b = token('b', known);
		const c = token('c', known);
		a1.outgoing.push(b);
		a2.outgoing.push(c);

		const roots: Node[] = [ a1, a2 ];
		mergeSiblings(roots, 10);

		expect(roots.length).toBe(1);
		expect(roots[0]).not.toBe(a1);
		expect(roots[0].outgoing).toEqual([ b, c ]);

		// The nodes it replaced are not changed
		expect(a1.outgoing).toEqual([ b ]);
		expect(a2.outgoing).toEqual([ c ]);
	});

	it('Keeps words of different graphs apart', function() {
		const a1 = token('a', new Set());
		const a2 = token('a', new Set());

		const roots: Node[] = [ a1, a2 ];
		mergeSiblings(roots, 10);

		expect(roots).toEqual([ a1, a2 ]);
	});

	it('Creates no more nodes than the limit', function() {
		const known = new Set<string>();
		const a1 = token('a', known);
		const a2 = token('a', known);

		const roots: Node[] = [ a1, a2 ];
		mergeSiblings(roots, 0);

		expect(roots).toEqual([ a1, a2 ]);
	});

	it('Merges a word that one phrase reaches in more ways', async function() {
		const phrases = newPhrases()
			.phrase('[please] open door')
			.phrase('open window')
			.build();

		// `please` and one node for `open`
		expect(phrases.toGraph(en).nodes.length).toBe(2);

		const matcher = phrases.toMatcher(en);
		expect(await matcher.match('please open door')).not.toBeNull();
		expect(await matcher.match('open door')).not.toBeNull();
		expect(await matcher.match('open window')).not.toBeNull();
		expect(await matcher.match('please open window')).toBeNull();
	});
});
