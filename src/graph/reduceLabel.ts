import { CollectorNode } from './CollectorNode.js';
import { CustomNode } from './CustomNode.js';
import type { Node } from './Node.js';
import { RegExpNode } from './RegExpNode.js';
import { SubNode } from './SubNode.js';
import { TokenNode } from './TokenNode.js';

/**
 * Numbers for the objects that the keys of one reduction refer to. Use a
 * new map for each reduction, so that the map does not keep memory after
 * the reduction.
 */
export type ObjectIds = Map<unknown, number>;

/**
 * Get the number of an object, or a text for a primitive value.
 *
 * @param ids -
 *   the numbers of the objects found so far
 * @param value -
 *   the value to identify
 * @returns
 *   text that is the same for the same object or primitive
 */
function identify(ids: ObjectIds, value: unknown): string {
	if((typeof value === 'object' && value !== null) || typeof value === 'function') {
		let id = ids.get(value);
		if(! id) {
			id = ids.size + 1;
			ids.set(value, id);
		}
		return '#' + id;
	}

	return typeof value + ':' + String(value);
}

/**
 * Gives a number to each node class.
 */
const classIds = new Map<Function, number>();

/**
 * Get a key for the label of a node. Two nodes with the same label always
 * have the same key. Two nodes with the same key can have different labels,
 * so use {@link sameLabel} to compare nodes that have the same key.
 *
 * @param ids -
 *   the numbers of the objects found so far in this reduction
 * @param node -
 *   the node
 * @returns
 *   the key
 */
export function labelKey(ids: ObjectIds, node: Node): string {
	let classId = classIds.get(node.constructor);
	if(! classId) {
		classId = classIds.size + 1;
		classIds.set(node.constructor, classId);
	}

	let key = classId + (node.supportsPunctuation ? 'p' : '-') + (node.readsAnyText ? 'a' : '-');

	const n = node as any;
	if(node instanceof TokenNode) {
		key += node.token.raw;
	} else if(node instanceof RegExpNode) {
		key += identify(ids, String(n.regexp));
	} else if(node instanceof SubNode) {
		key += identify(ids, n.roots) + identify(ids, n.filter);
	} else if(node instanceof CustomNode) {
		key += identify(ids, n.validator);
	} else if(node instanceof CollectorNode) {
		key += n.depth + identify(ids, n.value);
	} else if(typeof n.id === 'string') {
		// Nodes of the resolver, such as values, have an id
		key += n.id;
	}

	return key;
}

/**
 * Get if two nodes have the same label, so that one node can take the place
 * of the other in a graph without a change to how the graph matches.
 *
 * The check uses `equals` in both directions. For the node classes of the
 * graph package it also compares the fields that `equals` does not compare
 * but that change how the node matches. For other node classes `equals`
 * must only be `true` for nodes that match in the same way.
 *
 * @param a -
 *   the first node
 * @param b -
 *   the second node
 * @returns
 *   `true` if the nodes have the same label
 */
export function sameLabel(a: Node, b: Node): boolean {
	if(a === b) return true;

	if(a.constructor !== b.constructor
		|| a.supportsPunctuation !== b.supportsPunctuation
		|| a.readsAnyText !== b.readsAnyText) {
		return false;
	}

	const x = a as any;
	const y = b as any;

	if(a instanceof CollectorNode) {
		/*
		 * Collectors with the same depth and the same value are the same. A
		 * function value is compared by identity, as two functions with the
		 * same source can use different variables.
		 */
		return x.depth === y.depth && x.value === y.value;
	}

	if(! a.equals(b) || ! b.equals(a)) {
		return false;
	}

	if(a instanceof TokenNode) {
		// The comparer and the known words of the graph change how a token matches
		return x.comparer === y.comparer
			&& x.knownTokens === y.knownTokens
			&& a.token.normalized === (b as TokenNode).token.normalized
			&& a.token.punctuation === (b as TokenNode).token.punctuation;
	} else if(a instanceof RegExpNode) {
		// `equals` only compares the source, the flags also change the match
		return x.regexp.flags === y.regexp.flags;
	} else if(a instanceof SubNode) {
		// `equals` only compares the graph and the filter
		return x.recursive === y.recursive
			&& x.supportsPartial === y.supportsPartial
			&& x.skipPunctuation === y.skipPunctuation
			&& x.supportsFuzzy === y.supportsFuzzy
			&& x.skippableTokens === y.skippableTokens
			&& x.mapper === y.mapper
			&& x.partialFallback === y.partialFallback
			&& x.name === y.name;
	}

	return true;
}
