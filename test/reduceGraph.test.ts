import { CollectorNode } from '../src/graph/CollectorNode.js';
import type { GraphTokens } from '../src/graph/GraphBuilder.js';
import { GraphBuilder } from '../src/graph/GraphBuilder.js';
import { GraphMatcher } from '../src/graph/GraphMatcher.js';
import type { Node } from '../src/graph/Node.js';
import { reduceGraph } from '../src/graph/reduceGraph.js';
import { RegExpNode } from '../src/graph/RegExpNode.js';
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
 * Get the root array of a builder without building it, so that the graph is
 * not reduced by `build`.
 *
 * @param builder -
 *   the builder
 * @returns
 *   the root array of the builder
 */
function rootsOf(builder: GraphBuilder<any>): Node[] {
	return (builder as any).nodes;
}

/**
 * Words of the hand-built graphs. Token nodes only have the same label when
 * they share the words of their graph.
 */
const knownTokens = new Set<string>();

/**
 * Create a token node for a hand-built graph.
 *
 * @param raw -
 *   the word
 * @returns
 *   the node
 */
function token(raw: string): TokenNode {
	return new TokenNode(tokens.tokenComparer, whitespaceTokenizer(raw)[0], knownTokens);
}

/**
 * Find the outgoing node that is a token with the given text.
 *
 * @param nodes -
 *   the nodes to look in
 * @param raw -
 *   the word
 * @returns
 *   the node
 */
function child(nodes: Node[], raw: string): Node {
	const found = nodes.find(n => n instanceof TokenNode && n.token.raw === raw);
	if(! found) throw new Error('No node for ' + raw);
	return found;
}

/**
 * Match an expression against a root array and get all values.
 *
 * @param builder -
 *   the builder of the graph
 * @param roots -
 *   the root array to match against
 * @param text -
 *   the expression
 * @returns
 *   promise with the values of all matches
 */
function matchAll(builder: GraphBuilder<any>, roots: Node[], text: string) {
	const matcher = new GraphMatcher({
		tokenizer: whitespaceTokenizer,
		nodes: roots,
		options: { supportsPartial: false, skipPunctuation: false, supportsFuzzy: false }
	}, { mapper: m => m.data });
	return matcher.matchAll(text);
}

describe('reduceGraph', function() {
	it('Shares a suffix', function() {
		const builder = new GraphBuilder<number>(tokens)
			.add('a x y', 1)
			.add('b x y', 1);
		const roots = rootsOf(builder);

		const stats = reduceGraph(roots);

		expect(stats.cycle).toBe(false);
		expect(stats.nodesBefore).toBe(8);
		expect(stats.nodesAfter).toBe(5);
		expect(child(roots, 'a').outgoing[0]).toBe(child(roots, 'b').outgoing[0]);
	});

	it('Merges a prefix that the trie did not merge', function() {
		const a1 = token('a');
		const a2 = token('a');
		const b = token('b');
		const c = token('c');
		a1.outgoing.push(b);
		a2.outgoing.push(c);
		b.outgoing.push(new CollectorNode(0, 1));
		c.outgoing.push(new CollectorNode(0, 2));

		const roots = [ a1, a2 ];
		reduceGraph(roots);

		expect(roots).toEqual([ a1 ]);
		expect(a1.outgoing).toEqual([ b, c ]);
	});

	it('Keeps token nodes of different graphs apart', function() {
		const a1 = new TokenNode(tokens.tokenComparer, whitespaceTokenizer('a')[0], new Set());
		const a2 = new TokenNode(tokens.tokenComparer, whitespaceTokenizer('a')[0], new Set());

		const roots: Node[] = [ a1, a2 ];
		reduceGraph(roots);

		expect(roots).toEqual([ a1, a2 ]);
	});

	it('Reduces `a [b] [c] d` to one node per word', async function() {
		const builder = new GraphBuilder<number>(tokens)
			.add('a d', 1)
			.add('a b d', 1)
			.add('a c d', 1)
			.add('a b c d', 1);
		const roots = rootsOf(builder);

		const stats = reduceGraph(roots);

		// The words a, b, c, d and the collector
		expect(stats.nodesAfter).toBe(5);
		expect(stats.edgesAfter).toBe(8);

		const a = child(roots, 'a');
		const b = child(a.outgoing, 'b');
		const c = child(a.outgoing, 'c');
		const d = child(a.outgoing, 'd');
		expect(a.outgoing).toEqual([ d, b, c ]);
		expect(b.outgoing).toEqual([ d, c ]);
		expect(c.outgoing).toEqual([ d ]);

		for(const text of [ 'a d', 'a b d', 'a c d', 'a b c d' ]) {
			expect(await matchAll(builder, roots, text)).toEqual([ 1 ]);
		}

		expect(await matchAll(builder, roots, 'a c b d')).toEqual([]);
		expect(await matchAll(builder, roots, 'a b')).toEqual([]);
	});

	it('Keeps collectors with different values apart', async function() {
		const builder = new GraphBuilder<number>(tokens)
			.add('a x', 1)
			.add('b x', 2);
		const roots = rootsOf(builder);

		const stats = reduceGraph(roots);

		expect(stats.nodesAfter).toBe(stats.nodesBefore);
		expect(child(roots, 'a').outgoing[0]).not.toBe(child(roots, 'b').outgoing[0]);
		expect(await matchAll(builder, roots, 'a x')).toEqual([ 1 ]);
		expect(await matchAll(builder, roots, 'b x')).toEqual([ 2 ]);
	});

	it('Keeps collectors with different closures apart', function() {
		const builder = new GraphBuilder<number>(tokens)
			.add('a x', () => 1)
			.add('b x', () => 1);
		const roots = rootsOf(builder);

		const stats = reduceGraph(roots);

		expect(stats.nodesAfter).toBe(stats.nodesBefore);
	});

	it('Keeps regular expressions with different flags apart', function() {
		const roots: Node[] = [ new RegExpNode(/a/), new RegExpNode(/a/i) ];
		roots[0].outgoing.push(new CollectorNode(1, 1));
		roots[1].outgoing.push(new CollectorNode(1, 1));

		reduceGraph(roots);

		expect(roots.length).toBe(2);
	});

	it('Keeps the identity of the root array', function() {
		const builder = new GraphBuilder<number>(tokens)
			.add('a', 1)
			.add('b', 1);
		const roots = rootsOf(builder);

		reduceGraph(roots);

		expect(rootsOf(builder)).toBe(roots);
		expect(builder.build().nodes).toBe(roots);
		expect(roots.length).toBe(2);
		expect(roots[0].outgoing[0]).toBe(roots[1].outgoing[0]);
	});

	it('Leaves a graph with a cycle unchanged', function() {
		const a = token('a');
		const b = token('b');
		const b2 = token('b');
		a.outgoing.push(b, b2);
		b.outgoing.push(a);

		const roots: Node[] = [ a ];
		const stats = reduceGraph(roots);

		expect(stats.cycle).toBe(true);
		expect(stats.rounds).toBe(0);
		expect(roots).toEqual([ a ]);
		expect(a.outgoing).toEqual([ b, b2 ]);
		expect(b.outgoing).toEqual([ a ]);
	});

	it('Needs no second round for a trie', function() {
		const builder = new GraphBuilder<number>(tokens);
		for(const p of [ 'x a b', 'x b', 'y a b', 'y b', 'x c', 'y c' ]) {
			builder.add(p, 1);
		}
		const roots = rootsOf(builder);

		const stats = reduceGraph(roots);

		expect(stats.rounds).toBe(1);
		expect(roots.length).toBe(2);
		expect(roots[0].outgoing).toEqual(roots[1].outgoing);
		expect(reduceGraph(roots).rounds).toBe(0);
	});

	it('Merges phrases that start with the same words', async function() {
		const phrases = newPhrases()
			.phrase('show orders')
			.phrase('show orders today')
			.build();
		const graph = phrases.toGraph(en);

		// Both phrases start with the one node for `show`
		expect(graph.nodes.length).toBe(1);

		const matcher = phrases.toMatcher(en);
		expect(await matcher.match('show orders today')).not.toBeNull();
		expect(await matcher.match('show orders')).not.toBeNull();
		expect(await matcher.match('show today')).toBeNull();
	});
});
