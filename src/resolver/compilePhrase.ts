import type { Collectable, GraphBuildable, GraphBuilder } from '../graph/index.js';
import { CollectorNode, Node, RegExpNode, SubNode, TokenNode } from '../graph/index.js';
import type { Token, Tokens } from '../tokenization/index.js';
import type { NodeConvertable } from '../values/base.js';

import { checkVariantCount, describeLeftover, LEFTOVER_BRACE, parsePhraseSyntax, VALUE } from './phraseSyntax.js';

/**
 * What the phrase compiler needs from the parser.
 */
export interface CompileContext {
	/**
	 * The parser, given to items that are functions that create a node.
	 */
	builder: GraphBuilder<any>;

	/**
	 * Split text into tokens with the tokenizer of the parser.
	 */
	tokenize: (text: string) => Tokens;

	/**
	 * Create the node for a word, and record the word as a word of the graph.
	 */
	createTokenNode: (token: Token) => Node;

	/**
	 * Get the value that is registered with a name.
	 */
	value: (id: string) => NodeConvertable<any> | undefined;

	/**
	 * Add nodes to the start of the graph. The nodes are added after the
	 * nodes that are there, and are not merged with them.
	 */
	addRoots: (nodes: Node[]) => void;
}

/**
 * A part of a phrase as a set of nodes (a position automaton). Each node is
 * one position of the part, and the nodes of the part are connected to each
 * other with `outgoing`.
 */
interface Fragment {
	/**
	 * The nodes that a path through the part can start with, in the order
	 * they are tried.
	 */
	first: Node[];

	/**
	 * The nodes that a path through the part can end with.
	 */
	last: Node[];

	/**
	 * If a path through the part can read nothing.
	 */
	nullable: boolean;

	/**
	 * The names of the values on any path through the part.
	 */
	names: Set<string>;

	/**
	 * The number of ways the part can be written, which is the number of
	 * paths through it. A path that reads nothing is included.
	 */
	ways: number;
}

/**
 * Create a part that reads nothing.
 *
 * @returns
 *   the part
 */
function empty(): Fragment {
	return { first: [], last: [], nullable: true, names: new Set(), ways: 1 };
}

/**
 * Create a part that is a chain of nodes.
 *
 * @param first -
 *   the first node of the chain
 * @param last -
 *   the last node of the chain
 * @returns
 *   the part
 */
function single(first: Node, last: Node = first): Fragment {
	return { first: [ first ], last: [ last ], nullable: false, names: new Set(), ways: 1 };
}

/**
 * Join two parts so that `b` comes after `a`. Each node that a path through
 * `a` can end with is connected to each node that a path through `b` can
 * start with. Every path through `a` can be followed by every path through
 * `b`, so a name in both parts is a name that a path has two times.
 *
 * @param a -
 *   the part that comes first, its nodes are changed
 * @param b -
 *   the part that comes after
 * @param text -
 *   the phrase, for the error message
 * @returns
 *   the joined part
 * @throws
 *   if a path has a value name two times, or the joined part can be
 *   written in more than `MAX_PHRASE_VARIANTS` ways
 */
function sequence(a: Fragment, b: Fragment, text: string): Fragment {
	for(const name of b.names) {
		if(a.names.has(name)) {
			throw usedTwice(name, text);
		}
	}

	const ways = a.ways * b.ways;
	checkVariantCount(ways, text);

	for(const node of a.last) {
		node.outgoing.push(...b.first);
	}

	return {
		/*
		 * The nodes of `a` come first, so a path that reads `a` is tried
		 * before a path that leaves `a` out.
		 */
		first: a.nullable ? [ ...a.first, ...b.first ] : a.first,
		last: b.nullable ? [ ...b.last, ...a.last ] : b.last,
		nullable: a.nullable && b.nullable,
		names: new Set([ ...a.names, ...b.names ]),
		ways: ways
	};
}

/**
 * Join parts so that a path goes through one of them.
 *
 * @param parts -
 *   the parts, in the order they are tried
 * @returns
 *   the joined part
 */
function alternation(parts: Fragment[]): Fragment {
	const result = empty();
	result.nullable = parts.length === 0;
	result.ways = parts.length === 0 ? 1 : 0;

	for(const part of parts) {
		result.first.push(...part.first);
		result.last.push(...part.last);
		result.nullable ||= part.nullable;
		result.ways += part.ways;
		for(const name of part.names) {
			result.names.add(name);
		}
	}

	return result;
}

/**
 * Create the error for a value name that a path has two times.
 *
 * @param id -
 *   the name of the value
 * @param text -
 *   the phrase
 * @returns
 *   the error
 */
function usedTwice(id: string, text: string): Error {
	/*
	 * A phrase gives one value for each name, so a second use of the
	 * same name would replace the value of the first.
	 */
	return new Error(
		'`{' + id + '}` is used more than once in `' + text + '`,'
		+ ' give each value in a phrase its own name'
	);
}

/**
 * Compile a phrase with groups into nodes that share the words around each
 * group, and add the nodes to the graph of the parser.
 *
 * The phrase is not expanded into each way it can be written. Each word and
 * value of the phrase becomes one node (a Glushkov construction), and a group
 * becomes extra edges between the nodes before and after it. A phrase with
 * `n` groups that can be left out thus gives `O(n)` nodes and `O(n^2)` edges,
 * not `2^n` paths. Only a word that has groups in it, such as `order[s]`, is
 * expanded, as each way to write it is a different word. The number of
 * paths is still limited by `MAX_PHRASE_VARIANTS`.
 *
 * The matcher keeps the state of a path in the encounter, so a node that is
 * on several paths gives the same matches as a copy of the node for each
 * path.
 *
 * The nodes of the phrase are added to the start of the graph without being
 * merged into the nodes of other phrases. A node of this phrase can be on
 * several paths, so a later phrase must not add nodes after it.
 *
 * @param context -
 *   access to the parser
 * @param items -
 *   the items of the phrase
 * @param value -
 *   the value to record when the phrase matches
 */
export function compilePhrase<V>(context: CompileContext, items: GraphBuildable<V>[], value: Collectable<V>): void {
	const phraseText = items.filter(i => typeof i === 'string').join(' ');

	let phrase = empty();
	let depth = 0;
	for(const item of items) {
		const part = typeof item === 'string'
			? compileText(context, item)
			: compileItem(context, item);

		/*
		 * The collector gets the data of one node for each item that does
		 * not start with a word. This is the depth that the longest way to
		 * write the phrase gives when it is expanded.
		 */
		if(part.first.some(node => ! (node instanceof TokenNode))) {
			depth++;
		}

		phrase = sequence(phrase, part, phraseText);
	}

	if(phrase.first.length === 0) {
		throw new Error('Phrase does not contain anything to match: ' + phraseText);
	}

	/*
	 * Each path ends in the same collector. The result handler of phrases
	 * reads the values from `encounter.data()`, and not from the data that
	 * the collector gives it, so the depth only has an effect on other
	 * handlers.
	 */
	const collector = new CollectorNode(depth, value);
	for(const node of phrase.last) {
		node.outgoing.push(collector);
	}

	context.addRoots(phrase.first);
}

/**
 * Compile an item of a phrase that is not text. The item becomes a node in
 * the same way as in `GraphBuilder.add`.
 *
 * @param context -
 *   access to the parser
 * @param item -
 *   the item
 * @returns
 *   the part for the item
 */
function compileItem<V>(context: CompileContext, item: Exclude<GraphBuildable<V>, string>): Fragment {
	let node: Node;
	if(typeof item === 'function') {
		node = item(context.builder);
		if(! (node instanceof Node)) {
			throw new Error('Not a node: ' + node);
		}
	} else if(item instanceof RegExp) {
		node = new RegExpNode(item);
	} else if(item instanceof Node) {
		node = item;
	} else if('nodes' in item) {
		node = new SubNode(item, item.options);
	} else {
		throw new Error('Invalid node');
	}

	// A node can come with nodes after it, the next item comes after the last
	let last = node;
	while(last.outgoing.length > 0) {
		if(last.outgoing.length > 1) {
			throw new Error('Too many outgoing nodes, branching is not supported yet');
		}

		last = last.outgoing[0];
	}

	return single(node, last);
}

/**
 * Compile an item of a phrase that is text, which can have groups of
 * alternatives. A path through the item that reads nothing is not added, so
 * a group that is left out can not make the item empty.
 *
 * @param context -
 *   access to the parser
 * @param text -
 *   the text of the item
 * @returns
 *   the part for the item
 */
function compileText(context: CompileContext, text: string): Fragment {
	let result = empty();
	for(const segment of parsePhraseSyntax(text)) {
		const part = alternation(segment.alternatives.map(alternative => compileLiteral(context, alternative, text)));
		if(segment.optional) {
			// Leaving the part out is one more way to write it
			part.nullable = true;
			part.ways++;
		}

		result = sequence(result, part, text);
	}

	if(result.first.length === 0) {
		throw new Error('Phrase does not contain anything to match: ' + text);
	}

	if(result.nullable) {
		// The path that reads nothing is left out
		result.nullable = false;
		result.ways--;
	}

	return result;
}

/**
 * Compile text without groups into a chain of nodes for its words and
 * values. Values are read in the same way as in `ResolverParser.parse`.
 *
 * @param context -
 *   access to the parser
 * @param literal -
 *   the text to compile
 * @param text -
 *   the phrase, for error messages
 * @returns
 *   the part for the text
 */
function compileLiteral(context: CompileContext, literal: string, text: string): Fragment {
	let result = empty();

	const parse = (from: number, to: number) => {
		const sub = literal.substring(from, to);

		/*
		 * This text is everything the values were not read from, so a
		 * brace here is a value that was written wrong.
		 */
		if(LEFTOVER_BRACE.test(sub)) {
			throw new Error(
				'`' + describeLeftover(sub) + '` in `' + text + '` is not a value,'
				+ ' a value is named with the letters a-z, A-Z and the digits 0-9,'
				+ ' as in `{when}`'
			);
		}

		for(const token of context.tokenize(sub)) {
			result = sequence(result, single(context.createTokenNode(token)), text);
		}
	};

	let previousIndex = 0;

	/*
	 * `matchAll` reads the text with a copy of the expression, so a value
	 * that reads another phrase in `toNode` does not move the place this
	 * phrase is read from.
	 */
	for(const match of literal.matchAll(VALUE)) {
		if(match.index !== 0) {
			parse(previousIndex, match.index);
		}
		previousIndex = match.index + match[0].length;

		const id = match[1];
		const value = context.value(id);
		if(! value) {
			throw new Error('No type registered for ' + id);
		}

		if(result.names.has(id)) {
			throw usedTwice(id, text);
		}

		const part = single(value.toNode(id));
		part.names.add(id);
		result = sequence(result, part, text);
	}

	parse(previousIndex, literal.length);

	return result;
}
