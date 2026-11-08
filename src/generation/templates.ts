import type { Graph, Node } from '../graph/index.js';
import { CollectorNode, TokenNode } from '../graph/index.js';
import { ValueNode } from '../resolver/ValueNode.js';
import { ValueParserNode } from '../resolver/ValueParserNode.js';
import { ValueStatic } from '../resolver/ValueStatic.js';
import type { Token } from '../tokenization/index.js';

import type { Template, TemplatePart } from './Template.js';

/**
 * Gives the ways to write phrases that have exactly the given values, with
 * the fewest words first. The ways are found while they are read, so a
 * caller that only reads the first few does not pay for the others.
 */
export type TemplateSource = (values: readonly string[]) => Iterable<Template>;

/**
 * The longest path that is followed while reading templates out of a graph
 * that has a loop. Paths that go around the loop are cut off at this length.
 */
const MAX_LENGTH = 60;

/**
 * The highest number of values that a search keeps track of. Each value is
 * a bit in a number.
 */
const MAX_VALUES = 30;

/**
 * Read every way the phrases of a graph can be written. The graph is walked
 * from its roots to the nodes that collect a match, and each path that is
 * made up of words and values becomes a template.
 *
 * Paths that contain something which can not be turned back into text, such
 * as a regular expression, are left out.
 *
 * This reads every way, and a phrase with many groups can be written in very
 * many ways. Use {@link searchTemplates} to read only the ways that are
 * needed.
 *
 * @param graph -
 *   the graph to read
 * @returns
 *   the templates, with the fewest words first and templates with the same
 *   number of words in the order of the graph
 */
export function templatesFrom(graph: Graph<any>): Template[] {
	return [ ...new TemplateSearch(graph.nodes).find(undefined) ];
}

/**
 * Create a source that finds the ways the phrases of a graph can be written
 * while they are read. Templates come out in the same order as from
 * {@link templatesFrom}: the fewest words first, and templates with the same
 * number of words in the order of the graph.
 *
 * @param graph -
 *   the graph to read
 * @returns
 *   the source of templates
 */
export function searchTemplates(graph: Graph<any>): TemplateSource {
	const search = new TemplateSearch(graph.nodes);
	return values => search.find(values);
}

/**
 * Finds the templates of a graph, one number of words at a time.
 *
 * For each node the search knows the exact numbers of words that a path from
 * the node to a collector can have, and which values such a path has. A path
 * is only followed when it can end with the number of words being looked
 * for and with the values being looked for. Every path that is followed thus
 * gives a template, and the work grows with the number of templates that are
 * read, and not with the number of ways to write the phrase.
 *
 * Two paths that reach the same node with the same text go on in the same
 * ways, so only the first one is followed. This keeps the work low when
 * groups can read the same words, such as `[show] [show] orders`.
 */
class TemplateSearch {
	private readonly roots: readonly Node[];

	/**
	 * If the graph has a loop, found when it is first needed.
	 */
	private cyclic: boolean | undefined;

	/**
	 * The lengths of paths for each set of values that has been looked for.
	 */
	private readonly lengths: Map<string, PathLengths>;

	/**
	 * Numbers for the nodes, used in the keys of states.
	 */
	private readonly nodeIds: Map<Node, number>;

	public constructor(roots: readonly Node[]) {
		this.roots = roots;
		this.lengths = new Map();
		this.nodeIds = new Map();
	}

	/**
	 * Find the templates that have exactly the given values.
	 *
	 * @param values -
	 *   the identifiers of the values, or `undefined` for templates with any
	 *   values
	 * @returns
	 *   the templates, with the fewest words first
	 */
	public *find(values: readonly string[] | undefined): Generator<Template> {
		if(this.isCyclic() || (values && values.length > MAX_VALUES)) {
			yield* walkAll(this.roots, values);
			return;
		}

		const lengths = this.lengthsFor(values);
		const all = values ? (1 << values.length) - 1 : 0;

		let possible = 0n;
		for(const root of this.roots) {
			possible |= lengths.of(root, all);
		}

		const seen = new Set<string>();
		for(let words = 0; (possible >> BigInt(words)) > 0n; words++) {
			if(((possible >> BigInt(words)) & 1n) === 0n) continue;

			yield* this.level(lengths, all, words, seen);
		}
	}

	/**
	 * Find the templates with the given number of words.
	 *
	 * @param lengths -
	 *   the lengths of paths for the values being looked for
	 * @param all -
	 *   the bits of all values being looked for
	 * @param words -
	 *   the number of words
	 * @param seen -
	 *   the keys of the templates found so far
	 * @returns
	 *   the templates, in the order of the graph
	 */
	private *level(lengths: PathLengths, all: number, words: number, seen: Set<string>): Generator<Template> {
		const states = new Set<string>();

		const visit = function*(
			this: TemplateSearch,
			nodes: readonly Node[],
			parts: readonly TemplatePart[],
			tokens: readonly Token[],
			count: number,
			missing: number,
			key: string
		): Generator<Template> {
			const left = BigInt(words - count);
			for(const node of nodes) {
				if(((lengths.of(node, missing) >> left) & 1n) === 0n) continue;

				// A path that reached this node with the same text goes on in the same ways
				const state = this.idOf(node) + key;
				if(states.has(state)) continue;
				states.add(state);

				if(node instanceof TokenNode) {
					yield* visit.call(this, node.outgoing, parts, [ ...tokens, node.token ], count + 1, missing, key + '\u0000' + node.token.raw);
				} else if(node instanceof ValueNode || node instanceof ValueParserNode) {
					const next: TemplatePart[] = [
						...flush(parts, tokens),
						{ type: 'value', id: node.id }
					];

					yield* visit.call(this, node.outgoing, next, [], count, missing & ~lengths.bitOf(node.id), key + '\u0001' + node.id);
				} else if(node instanceof ValueStatic) {
					yield* visit.call(this, node.outgoing, parts, tokens, count, missing, key);
				} else if(node instanceof CollectorNode) {
					const template = toTemplate(flush(parts, tokens));
					const templateId = templateKey(template);
					if(! seen.has(templateId)) {
						seen.add(templateId);
						yield template;
					}
				}
			}
		};

		yield* visit.call(this, this.roots, [], [], 0, all, '');
	}

	/**
	 * Get the lengths of paths for the given values.
	 *
	 * @param values -
	 *   the identifiers of the values, or `undefined` for any values
	 * @returns
	 *   the lengths
	 */
	private lengthsFor(values: readonly string[] | undefined): PathLengths {
		const key = values ? JSON.stringify([ ...values ].sort()) : '*';
		let lengths = this.lengths.get(key);
		if(! lengths) {
			lengths = new PathLengths(values);
			this.lengths.set(key, lengths);
		}

		return lengths;
	}

	/**
	 * Get the number of a node.
	 *
	 * @param node -
	 *   the node
	 * @returns
	 *   the number
	 */
	private idOf(node: Node): number {
		let id = this.nodeIds.get(node);
		if(id === undefined) {
			id = this.nodeIds.size;
			this.nodeIds.set(node, id);
		}

		return id;
	}

	/**
	 * Get if a path through the graph can reach a node it has already been
	 * through.
	 *
	 * @returns
	 *   `true` if the graph has a loop
	 */
	private isCyclic(): boolean {
		if(this.cyclic === undefined) {
			this.cyclic = hasCycle(this.roots);
		}

		return this.cyclic;
	}
}

/**
 * The numbers of words that paths from a node to a collector can have, for
 * one set of values. A path only counts when it has no other values than the
 * ones looked for.
 */
class PathLengths {
	private readonly values: readonly string[] | undefined;

	/**
	 * The lengths for each node, and for each set of values that a path from
	 * the node must still read.
	 */
	private readonly cache: Map<Node, Map<number, bigint>>;

	public constructor(values: readonly string[] | undefined) {
		this.values = values;
		this.cache = new Map();
	}

	/**
	 * Get the bit of a value. Any value has no bit when any values are looked
	 * for.
	 *
	 * @param id -
	 *   the identifier of the value
	 * @returns
	 *   the bit, or `0`
	 */
	public bitOf(id: string): number {
		const index = this.values ? this.values.indexOf(id) : -1;
		return index < 0 ? 0 : 1 << index;
	}

	/**
	 * Get the numbers of words that a path from a node to a collector can
	 * have. The words of the node itself are counted.
	 *
	 * @param node -
	 *   the node
	 * @param missing -
	 *   the bits of the values that the path must still read
	 * @returns
	 *   a number with bit `n` set if a path can have `n` words
	 */
	public of(node: Node, missing: number): bigint {
		let byMissing = this.cache.get(node);
		if(! byMissing) {
			byMissing = new Map();
			this.cache.set(node, byMissing);
		}

		let result = byMissing.get(missing);
		if(result === undefined) {
			result = this.compute(node, missing);
			byMissing.set(missing, result);
		}

		return result;
	}

	/**
	 * Find the numbers of words for a node that is not in the cache.
	 *
	 * @param node -
	 *   the node
	 * @param missing -
	 *   the bits of the values that the path must still read
	 * @returns
	 *   a number with bit `n` set if a path can have `n` words
	 */
	private compute(node: Node, missing: number): bigint {
		if(node instanceof CollectorNode) {
			return missing === 0 ? 1n : 0n;
		} else if(node instanceof TokenNode) {
			return this.after(node, missing) << 1n;
		} else if(node instanceof ValueNode || node instanceof ValueParserNode) {
			if(! this.values) {
				return this.after(node, missing);
			}

			// A value that is not looked for, or that the path has already read
			const bit = this.bitOf(node.id);
			if((missing & bit) === 0) {
				return 0n;
			}

			return this.after(node, missing & ~bit);
		} else if(node instanceof ValueStatic) {
			return this.after(node, missing);
		}

		// Nothing else can be written as text
		return 0n;
	}

	/**
	 * Get the numbers of words of paths that start after a node.
	 *
	 * @param node -
	 *   the node
	 * @param missing -
	 *   the bits of the values that the path must still read
	 * @returns
	 *   a number with bit `n` set if a path can have `n` words
	 */
	private after(node: Node, missing: number): bigint {
		let result = 0n;
		for(const next of node.outgoing) {
			result |= this.of(next, missing);
		}

		return result;
	}
}

/**
 * Get if a graph has a loop through the nodes that templates are read from.
 *
 * @param roots -
 *   the roots of the graph
 * @returns
 *   `true` if a node can be reached from itself
 */
function hasCycle(roots: readonly Node[]): boolean {
	const done = new Set<Node>();
	const onPath = new Set<Node>();

	const stack: { node: Node; next: number }[] = [];
	for(const root of roots) {
		if(done.has(root)) continue;

		stack.push({ node: root, next: 0 });
		onPath.add(root);
		while(stack.length > 0) {
			const top = stack[stack.length - 1];
			const outgoing = followed(top.node) ? top.node.outgoing : [];
			if(top.next < outgoing.length) {
				const node = outgoing[top.next++];
				if(onPath.has(node)) return true;
				if(done.has(node)) continue;

				stack.push({ node: node, next: 0 });
				onPath.add(node);
			} else {
				stack.pop();
				onPath.delete(top.node);
				done.add(top.node);
			}
		}
	}

	return false;
}

/**
 * Get if a path that reads templates continues after a node.
 *
 * @param node -
 *   the node
 * @returns
 *   `true` for words and values
 */
function followed(node: Node): boolean {
	return node instanceof TokenNode
		|| node instanceof ValueNode
		|| node instanceof ValueParserNode
		|| node instanceof ValueStatic;
}

/**
 * Read every template of a graph that can have a loop. Every path is
 * walked, and a path does not go through a node a second time.
 *
 * @param roots -
 *   the roots of the graph
 * @param values -
 *   the identifiers of the values to look for, or `undefined` for any values
 * @returns
 *   the templates, with the fewest words first
 */
function walkAll(roots: readonly Node[], values: readonly string[] | undefined): Template[] {
	const result: Template[] = [];
	const visited: Node[] = [];
	const seen = new Set<string>();

	const walk = (nodes: readonly Node[], parts: readonly TemplatePart[], tokens: readonly Token[]) => {
		if(visited.length >= MAX_LENGTH) return;

		for(const node of nodes) {
			if(visited.includes(node)) continue;

			visited.push(node);
			try {
				if(node instanceof TokenNode) {
					walk(node.outgoing, parts, [ ...tokens, node.token ]);
				} else if(node instanceof ValueNode || node instanceof ValueParserNode) {
					const next: TemplatePart[] = [
						...flush(parts, tokens),
						{ type: 'value', id: node.id }
					];

					walk(node.outgoing, next, []);
				} else if(node instanceof ValueStatic) {
					// Always present when the phrase matches and has no text
					walk(node.outgoing, parts, tokens);
				} else if(node instanceof CollectorNode) {
					const template = toTemplate(flush(parts, tokens));
					const key = templateKey(template);
					if(! seen.has(key) && (! values || sameValues(template.values, values))) {
						seen.add(key);
						result.push(template);
					}
				}
			} finally {
				visited.pop();
			}
		}
	};

	walk(roots, [], []);

	return result.sort((a, b) => a.words - b.words);
}

/**
 * Get if a template has exactly the given values.
 *
 * @param templateValues -
 *   the values of the template
 * @param values -
 *   the values looked for
 * @returns
 *   `true` if the template has these values and no others
 */
function sameValues(templateValues: readonly string[], values: readonly string[]): boolean {
	return templateValues.length === values.length
		&& values.every(id => templateValues.includes(id));
}

/**
 * Add the words gathered so far to the parts of a template.
 *
 * @param parts -
 *   the parts of the template
 * @param tokens -
 *   the words gathered since the last part
 * @returns
 *   the parts, with the words added as a part of their own
 */
function flush(parts: readonly TemplatePart[], tokens: readonly Token[]): TemplatePart[] {
	if(tokens.length === 0) return [ ...parts ];

	return [ ...parts, { type: 'text', tokens: tokens } ];
}

/**
 * Get a key that is the same for two templates with the same text and the
 * same values in the same places.
 *
 * @param template -
 *   the template
 * @returns
 *   the key
 */
function templateKey(template: Template): string {
	return JSON.stringify(template.parts.map(part => part.type === 'value'
		? { value: part.id }
		: part.tokens.map(token => token.raw)
	));
}

/**
 * Turn the parts of a template into the template itself.
 *
 * @param parts -
 *   the parts of the template
 * @returns
 *   the template
 */
function toTemplate(parts: TemplatePart[]): Template {
	const values: string[] = [];
	let words = 0;

	for(const part of parts) {
		if(part.type === 'value') {
			values.push(part.id);
		} else {
			words += part.tokens.length;
		}
	}

	return {
		parts: parts,
		values: values,
		words: words
	};
}
