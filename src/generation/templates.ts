import type { Graph, Node } from '../graph/index.js';
import { CollectorNode, TokenNode } from '../graph/index.js';
import { ValueNode } from '../resolver/ValueNode.js';
import { ValueParserNode } from '../resolver/ValueParserNode.js';
import { ValueStatic } from '../resolver/ValueStatic.js';
import type { Token } from '../tokenization/index.js';

import type { Template, TemplatePart } from './Template.js';

/**
 * The longest path that is followed while reading templates out of a graph.
 * Graphs that refer back to themselves are cut off at this length.
 */
const MAX_LENGTH = 60;

/**
 * Read every way the phrases of a graph can be written. The graph is walked
 * from its roots to the nodes that collect a match, and each path that is
 * made up of words and values becomes a template.
 *
 * Paths that contain something which can not be turned back into text, such
 * as a regular expression, are left out.
 *
 * @param graph -
 *   the graph to read
 * @returns
 *   the templates, with the shortest one first
 */
export function templatesFrom(graph: Graph<any>): Template[] {
	const result: Template[] = [];

	/**
	 * The nodes on the path being walked, used to stop a graph that refers
	 * back to itself from being followed forever.
	 */
	const visited: Node[] = [];

	/**
	 * Keys of the templates found so far. Two paths through a graph can read
	 * the same text, such as the paths of `[show] [show] orders` that read
	 * `show orders`, and the text is only added once.
	 */
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
					if(! seen.has(key)) {
						seen.add(key);
						result.push(template);
					}
				}

				/*
				 * Anything else, such as a regular expression or a sub-graph,
				 * has no text to write, so paths through it are left out.
				 */
			} finally {
				visited.pop();
			}
		}
	};

	walk(graph.nodes, [], []);

	// The shortest way to say something is the one worth generating
	return result.sort((a, b) => a.words - b.words);
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
