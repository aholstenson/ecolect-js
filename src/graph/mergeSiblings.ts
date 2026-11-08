import type { Node } from './Node.js';
import type { ObjectIds } from './reduceLabel.js';
import { labelKey, sameLabel } from './reduceLabel.js';
import { TokenNode } from './TokenNode.js';

/**
 * Merge word nodes with the same label that are in the same list of nodes,
 * such as the roots of a graph or the nodes after a node. A path that reads
 * the word then tests it one time, and not one time for each node.
 *
 * The merged node is a new node that has the nodes after each of the nodes
 * it replaces, in the same order. The nodes it replaces are kept, as other
 * lists can have them. The list after a merged node is merged in the same
 * way. This is the subset construction of a deterministic automaton, done
 * only for word nodes, so the graph matches the same expressions.
 *
 * The merged node takes the place of the first node it replaces, so a path
 * through a node that came later in the list is tried earlier. This can
 * change which of two matches with the same score is kept, but not the
 * values or the scores.
 *
 * @param roots -
 *   the root nodes of the graph, changed in place
 * @param limit -
 *   the highest number of merged nodes to create, as the subset
 *   construction can create many nodes for some graphs
 */
export function mergeSiblings(roots: Node[], limit: number): void {
	const ids: ObjectIds = new Map();
	const nodeIds = new Map<Node, number>();
	const merged = new Map<string, TokenNode>();
	const done = new Set<Node[]>();
	let created = 0;

	const idOf = (node: Node) => {
		let id = nodeIds.get(node);
		if(id === undefined) {
			id = nodeIds.size;
			nodeIds.set(node, id);
		}
		return id;
	};

	const queue: Node[][] = [ roots ];
	while(queue.length > 0) {
		const list = queue.pop() as Node[];
		if(done.has(list)) continue;
		done.add(list);

		const replace = new Map<Node, Node | null>();
		for(const group of sameWordGroups(ids, list)) {
			// The same set of nodes is merged into the same node in every list
			const key = group.map(idOf).sort((a, b) => a - b).join(',');
			let node = merged.get(key);
			if(! node) {
				if(created >= limit) continue;

				node = copyWithout(group[0]);
				for(const member of group) {
					for(const next of member.outgoing) {
						if(! node.outgoing.includes(next)) node.outgoing.push(next);
					}
				}

				merged.set(key, node);
				created++;
			}

			replace.set(group[0], node);
			for(let i=1; i<group.length; i++) {
				replace.set(group[i], null);
			}
		}

		if(replace.size > 0) {
			const result: Node[] = [];
			for(const node of list) {
				const replacement = replace.get(node);
				if(replacement === undefined) {
					result.push(node);
				} else if(replacement !== null && ! result.includes(replacement)) {
					result.push(replacement);
				}
			}

			list.length = 0;
			list.push(...result);
		}

		for(const node of list) {
			queue.push(node.outgoing);
		}
	}
}

/**
 * Find the word nodes of a list that have the same label as another word
 * node of the list.
 *
 * @param ids -
 *   the numbers of the objects that labels refer to
 * @param list -
 *   the list of nodes
 * @returns
 *   groups of two or more nodes with the same label, in the order of the list
 */
function sameWordGroups(ids: ObjectIds, list: Node[]): TokenNode[][] {
	const byKey = new Map<string, TokenNode[][]>();
	for(const node of list) {
		if(! (node instanceof TokenNode)) continue;

		const key = labelKey(ids, node);
		const groups = byKey.get(key);
		if(! groups) {
			byKey.set(key, [ [ node ] ]);
			continue;
		}

		const group = groups.find(g => sameLabel(g[0], node));
		if(! group) {
			groups.push([ node ]);
		} else if(! group.includes(node)) {
			group.push(node);
		}
	}

	const result: TokenNode[][] = [];
	for(const groups of byKey.values()) {
		for(const group of groups) {
			if(group.length > 1) result.push(group);
		}
	}

	return result;
}

/**
 * Create a copy of a word node without the nodes after it.
 *
 * @param node -
 *   the node to copy
 * @returns
 *   the copy
 */
function copyWithout(node: TokenNode): TokenNode {
	const copy = Object.create(Object.getPrototypeOf(node)) as TokenNode;
	Object.assign(copy, node);
	copy.outgoing = [];
	return copy;
}
