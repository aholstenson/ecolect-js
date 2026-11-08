import type { Node } from './Node.js';
import type { ObjectIds } from './reduceLabel.js';
import { labelKey, sameLabel } from './reduceLabel.js';

/**
 * The result of reducing a graph.
 */
export interface ReduceStats {
	/**
	 * The number of rounds that merged one or more nodes. Each round does a
	 * merge from the end of the graph and then a merge from the start.
	 */
	rounds: number;

	/**
	 * The number of nodes reachable from the roots before the reduction.
	 * The nodes of sub-graphs are not counted.
	 */
	nodesBefore: number;

	/**
	 * The number of nodes reachable from the roots after the reduction.
	 */
	nodesAfter: number;

	/**
	 * The number of edges between reachable nodes before the reduction,
	 * including the edges from the root list.
	 */
	edgesBefore: number;

	/**
	 * The number of edges between reachable nodes after the reduction.
	 */
	edgesAfter: number;

	/**
	 * `true` if the graph has a cycle. A graph with a cycle is not changed.
	 */
	cycle: boolean;
}

/**
 * Index of the virtual node that is the predecessor of every root.
 */
const ROOT = -1;

/**
 * Merge nodes of a graph that have the same label, so that the graph has
 * fewer nodes but matches exactly the same. The root array and the
 * `outgoing` arrays are changed in place, so every reference to the root
 * array, such as a sub-graph that refers to its own graph, sees the change.
 *
 * The graph is an acyclic automaton where each node is the label of its own
 * state. Two kinds of merge are done until a round merges no nodes:
 *
 * 1. Merge from the end: nodes are visited from the sinks up, by the
 *    longest path to a sink. Nodes with the same label and the same set of
 *    successors are merged. This shares equal endings.
 * 2. Merge from the start: nodes are visited in topological order. Nodes
 *    with the same label and the same set of predecessors are merged, and
 *    the merged node gets the successors of both. This shares equal starts,
 *    in the same way as the trie that `GraphBuilder.add` makes. The root
 *    list counts as one predecessor.
 *
 * The order of the edges is kept: a merged node keeps the edges of the
 * node that was found first and then adds the new edges of the other node.
 * Two edges to the same node become one. The nodes of a sub-graph are not
 * visited, as each graph is reduced when it is built.
 *
 * After the reduction a node can be on more than one path. Adding a node to
 * its `outgoing` array would add the node to every one of these paths.
 *
 * Do not use one node object in more than one graph. A merge can give a
 * node the edges of another node, and the other graph then also gets these
 * edges.
 *
 * @param roots -
 *   the root nodes of the graph, changed in place
 * @returns
 *   numbers about the reduction
 */
export function reduceGraph(roots: Node[]): ReduceStats {
	const initial = indexGraph(roots);
	const stats: ReduceStats = {
		rounds: 0,
		nodesBefore: initial ? initial.nodes.length : countNodes(roots),
		nodesAfter: 0,
		edgesBefore: initial ? countEdges(initial) : 0,
		edgesAfter: 0,
		cycle: ! initial
	};

	if(! initial) {
		// A graph with a cycle is left as it is
		stats.nodesAfter = stats.nodesBefore;
		return stats;
	}

	let graph = initial;
	const ids: ObjectIds = new Map();

	for(;;) {
		const fromEnd = mergeFromEnd(graph, ids);
		if(fromEnd) {
			writeBack(roots, graph);
			graph = indexMerged(roots);
		}

		const fromStart = mergeFromStart(graph, ids);
		if(fromStart) {
			writeBack(roots, graph);
			graph = indexMerged(roots);
		}

		if(! fromEnd && ! fromStart) break;

		stats.rounds++;
	}

	stats.nodesAfter = graph.nodes.length;
	stats.edgesAfter = countEdges(graph);

	return stats;
}

/**
 * Graph where each node has a number, used while the graph is reduced.
 */
interface IndexedGraph {
	/**
	 * The reachable nodes in topological order. When the graph is a tree
	 * this is the order in which a walk from the first root finds them.
	 */
	nodes: Node[];

	/**
	 * The successors of each node, as indexes in `nodes`.
	 */
	succ: number[][];

	/**
	 * The roots, as indexes in `nodes`.
	 */
	roots: number[];

	/**
	 * The node each node is merged into, or the index of the node itself.
	 */
	parent: Int32Array;
}

/**
 * Find all nodes that can be reached from the roots and give them numbers
 * in topological order.
 *
 * @param roots -
 *   the root nodes
 * @returns
 *   the indexed graph, or `undefined` if the graph has a cycle
 */
function indexGraph(roots: Node[]): IndexedGraph | undefined {
	/*
	 * Depth-first walk that visits the roots and the outgoing nodes from
	 * last to first. The reverse of the order in which the walk finishes
	 * the nodes is then a topological order. For a tree this order is the
	 * same as a walk that visits the nodes from first to last.
	 */
	const state = new Map<Node, number>();
	const finished: Node[] = [];

	const stack: Node[] = [];
	const nextChild: number[] = [];

	for(let r=roots.length-1; r>=0; r--) {
		const root = roots[r];
		if(state.has(root)) continue;

		state.set(root, 1);
		stack.push(root);
		nextChild.push(root.outgoing.length - 1);

		while(stack.length > 0) {
			const top = stack.length - 1;
			const node = stack[top];
			const i = nextChild[top];

			if(i < 0) {
				state.set(node, 2);
				finished.push(node);
				stack.pop();
				nextChild.pop();
				continue;
			}

			nextChild[top] = i - 1;
			const child = node.outgoing[i];
			const s = state.get(child);
			if(s === 1) {
				// The child is on the current path, so the graph has a cycle
				return undefined;
			} else if(s === undefined) {
				state.set(child, 1);
				stack.push(child);
				nextChild.push(child.outgoing.length - 1);
			}
		}
	}

	const nodes = finished.reverse();
	const index = new Map<Node, number>();
	for(let i=0; i<nodes.length; i++) {
		index.set(nodes[i], i);
	}

	const parent = new Int32Array(nodes.length);
	const succ: number[][] = [];
	for(let i=0; i<nodes.length; i++) {
		parent[i] = i;
		succ.push(uniqueIndexes(nodes[i].outgoing.map(n => index.get(n) as number)));
	}

	return {
		nodes,
		succ,
		roots: uniqueIndexes(roots.map(n => index.get(n) as number)),
		parent
	};
}

/**
 * Index a graph after a merge. A merge can not make a cycle, as two nodes
 * that are merged have the same predecessors or the same successors, so
 * neither of them can reach the other.
 *
 * @param roots -
 *   the root nodes
 * @returns
 *   the indexed graph
 */
function indexMerged(roots: Node[]): IndexedGraph {
	const graph = indexGraph(roots);
	if(! graph) {
		throw new Error('Merging the nodes of a graph made a cycle');
	}

	return graph;
}

/**
 * Find the node that a node has been merged into.
 *
 * @param graph -
 *   the graph
 * @param i -
 *   index of the node
 * @returns
 *   index of the node that represents the node
 */
function find(graph: IndexedGraph, i: number): number {
	const parent = graph.parent;
	let current = i;
	while(parent[current] !== current) {
		// Point to the grandparent, so that later calls take fewer steps
		parent[current] = parent[parent[current]];
		current = parent[current];
	}
	return current;
}

/**
 * Remove repeated indexes and keep the first of each.
 *
 * @param indexes -
 *   the indexes
 * @returns
 *   the indexes without repeats, in the same order
 */
function uniqueIndexes(indexes: number[]): number[] {
	if(indexes.length < 2) return indexes;

	const seen = new Set<number>();
	const result: number[] = [];
	for(const i of indexes) {
		if(seen.has(i)) continue;
		seen.add(i);
		result.push(i);
	}
	return result;
}

/**
 * Get the representative nodes of a list of nodes, without repeats.
 *
 * @param graph -
 *   the graph
 * @param indexes -
 *   the nodes
 * @returns
 *   the representative nodes, in the order they are first found
 */
function representatives(graph: IndexedGraph, indexes: number[]): number[] {
	return uniqueIndexes(indexes.map(i => find(graph, i)));
}

/**
 * Get a key for a set of nodes, which does not change with the order.
 *
 * @param indexes -
 *   the nodes, without repeats
 * @returns
 *   the key
 */
function setKey(indexes: number[]): string {
	return indexes.length < 2
		? String(indexes[0] ?? '')
		: indexes.slice().sort((a, b) => a - b).join(',');
}

/**
 * Find a node that was put in a bucket earlier and has the same label as
 * the given node. If there is none, put the node in the bucket.
 *
 * @param graph -
 *   the graph
 * @param buckets -
 *   the nodes found so far, by key
 * @param key -
 *   the key of the node
 * @param i -
 *   index of the node
 * @returns
 *   the index of the node with the same label, or `-1`
 */
function findOrAdd(
	graph: IndexedGraph,
	buckets: Map<string, number[]>,
	key: string,
	i: number
): number {
	const bucket = buckets.get(key);
	if(! bucket) {
		buckets.set(key, [ i ]);
		return -1;
	}

	const node = graph.nodes[i];
	for(const candidate of bucket) {
		if(sameLabel(graph.nodes[candidate], node)) {
			return candidate;
		}
	}

	bucket.push(i);
	return -1;
}

/**
 * Merge nodes that have the same label and the same set of successors. The
 * nodes are visited from the sinks up, so the successors of a node are
 * merged before the node itself.
 *
 * @param graph -
 *   the graph, its `parent` and `succ` are changed
 * @param ids -
 *   the numbers of the objects that the keys refer to
 * @returns
 *   `true` if a node was merged
 */
function mergeFromEnd(graph: IndexedGraph, ids: ObjectIds): boolean {
	const count = graph.nodes.length;

	// Longest path to a sink, found from the last node in topological order
	const height = new Int32Array(count);
	let maxHeight = 0;
	for(let i=count-1; i>=0; i--) {
		let h = 0;
		for(const s of graph.succ[i]) {
			if(height[s] + 1 > h) h = height[s] + 1;
		}
		height[i] = h;
		if(h > maxHeight) maxHeight = h;
	}

	// Sort by height, nodes with the same height stay in topological order
	const byHeight: number[][] = [];
	for(let h=0; h<=maxHeight; h++) byHeight.push([]);
	for(let i=0; i<count; i++) byHeight[height[i]].push(i);

	let changed = false;
	for(const level of byHeight) {
		const buckets = new Map<string, number[]>();
		for(const i of level) {
			const succ = representatives(graph, graph.succ[i]);
			graph.succ[i] = succ;

			const key = labelKey(ids, graph.nodes[i]) + '|' + setKey(succ);
			const same = findOrAdd(graph, buckets, key, i);
			if(same >= 0) {
				graph.parent[i] = same;
				changed = true;
			}
		}
	}

	return changed;
}

/**
 * Merge nodes that have the same label and the same set of predecessors.
 * The nodes are visited in topological order, so the predecessors of a node
 * are merged before the node itself. The merged node gets the successors of
 * both nodes.
 *
 * @param graph -
 *   the graph, its `parent` and `succ` are changed
 * @param ids -
 *   the numbers of the objects that the keys refer to
 * @returns
 *   `true` if a node was merged
 */
function mergeFromStart(graph: IndexedGraph, ids: ObjectIds): boolean {
	const count = graph.nodes.length;

	const pred: number[][] = [];
	for(let i=0; i<count; i++) pred.push([]);
	for(const r of graph.roots) pred[r].push(ROOT);
	for(let i=0; i<count; i++) {
		for(const s of graph.succ[i]) {
			pred[s].push(i);
		}
	}

	let changed = false;
	const buckets = new Map<string, number[]>();
	for(let i=0; i<count; i++) {
		const preds = uniqueIndexes(pred[i].map(p => p === ROOT ? ROOT : find(graph, p)));

		const key = labelKey(ids, graph.nodes[i]) + '|' + setKey(preds);
		const same = findOrAdd(graph, buckets, key, i);
		if(same >= 0) {
			graph.parent[i] = same;
			graph.succ[same] = uniqueIndexes(graph.succ[same].concat(graph.succ[i]));
			changed = true;
		}
	}

	return changed;
}

/**
 * Write the merged graph back into the root array and the `outgoing`
 * arrays of the nodes that are kept.
 *
 * @param roots -
 *   the root array, changed in place
 * @param graph -
 *   the merged graph
 */
function writeBack(roots: Node[], graph: IndexedGraph): void {
	const nodes = graph.nodes;

	replaceContent(roots, representatives(graph, graph.roots).map(i => nodes[i]));

	for(let i=0; i<nodes.length; i++) {
		if(find(graph, i) !== i) continue;

		const outgoing = representatives(graph, graph.succ[i]).map(s => nodes[s]);
		replaceContent(nodes[i].outgoing, outgoing);
	}
}

/**
 * Get if two arrays have the same items in the same order.
 *
 * @param a -
 *   the first array
 * @param b -
 *   the second array
 * @returns
 *   `true` if the arrays have the same items
 */
function sameContent<T>(a: T[], b: T[]): boolean {
	if(a.length !== b.length) return false;
	for(let i=0; i<a.length; i++) {
		if(a[i] !== b[i]) return false;
	}
	return true;
}

/**
 * Replace the items of an array in place, so that every reference to the
 * array sees the new items.
 *
 * @param target -
 *   the array to change
 * @param items -
 *   the new items
 */
function replaceContent<T>(target: T[], items: T[]): void {
	if(sameContent(target, items)) return;
	target.splice(0, target.length, ...items);
}

/**
 * Count the edges of an indexed graph, including the edges from the root
 * list.
 *
 * @param graph -
 *   the graph
 * @returns
 *   the number of edges
 */
function countEdges(graph: IndexedGraph): number {
	let edges = graph.roots.length;
	for(const succ of graph.succ) edges += succ.length;
	return edges;
}

/**
 * Count the nodes that can be reached from the roots, also when the graph
 * has a cycle.
 *
 * @param roots -
 *   the root nodes
 * @returns
 *   the number of nodes
 */
function countNodes(roots: Node[]): number {
	const seen = new Set<Node>();
	const stack = roots.slice();
	while(stack.length > 0) {
		const node = stack.pop() as Node;
		if(seen.has(node)) continue;
		seen.add(node);
		stack.push(...node.outgoing);
	}
	return seen.size;
}
