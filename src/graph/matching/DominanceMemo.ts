import type { Node } from '../Node.js';

import type { Match } from './Match.js';
import type { SubGraphEvaluation } from './SubGraphEvaluation.js';

/**
 * The state in which a path continues after a node. The nodes after the
 * node give the same matches for two paths in the same state, apart from
 * the score that the path had at the node and the nodes on the path.
 */
export interface MemoEntry {
	/**
	 * The best score of a path that continued from this state.
	 */
	score: number;

	/**
	 * The score of the path that continues from this state now, or that
	 * continued from it last.
	 */
	walkScore: number;

	/**
	 * The scores of every path that continued from this state. Only kept
	 * when `cutOff` is set, as a path is then only removed when an earlier
	 * path had the same score.
	 */
	walkScores: Set<number> | null;

	/**
	 * The number of evaluations from this state that are in progress. A path
	 * is only removed when the evaluation of the earlier path is done.
	 */
	active: number;

	/**
	 * Sub-graph evaluations whose seed the nodes after this node used. A
	 * removed path marks the seed as used in the same way, so that the
	 * sub-graph is evaluated again from the root the removed path started at.
	 */
	seedUses: Set<SubGraphEvaluation> | null;

	/**
	 * If a value after this node kept only its best matches and dropped
	 * others. In a partial match the score of a match is divided by its
	 * length, so which matches are the best depends on the score of the path
	 * that reached the value. A path with a lower score can then keep other
	 * matches, and it is only removed when its score is the same.
	 */
	cutOff: boolean;

	/**
	 * The length of the node stack of the path that last continued from this
	 * state. The nodes from this length on are the nodes after the state.
	 */
	depth: number;

	/**
	 * The matches that the nodes after this state added to the result of the
	 * encounter, the last one for each kind of match and score of the path
	 * that continued from the state. Only kept for the
	 * frame that adds to the result.
	 */
	records: MemoRecord[] | null;
}

/**
 * A match added to the result while the nodes after a state were evaluated.
 */
export interface MemoRecord {
	/**
	 * The match.
	 */
	readonly match: Match<any>;

	/**
	 * The length of the node stack of the path when it reached the state.
	 */
	readonly depth: number;

	/**
	 * The score of the path when it continued from the state. A match is
	 * only added again for a path with the same score.
	 */
	readonly score: number;
}

/**
 * Marks data that no collector reads, such as the empty value that a value
 * pushes when a partial expression ends before it. Paths whose data differs
 * only in such items continue in the same way.
 */
export const unreadData = Symbol('unreadData');

/**
 * Mark the given data as data that no collector reads.
 *
 * @param data -
 *   the data, changed in place
 * @returns
 *   the data
 */
export function markUnread<T extends object>(data: T): T {
	Object.defineProperty(data, unreadData, { value: true, enumerable: false });
	return data;
}

/**
 * Gives each data stack a number, so that two stacks with the same items
 * get the same number. A stack is the stack below it with one more item,
 * so its number is found from the number of the stack below it and the item.
 * Items are compared by identity.
 */
export class DataStackIds {
	/**
	 * The stacks that have one more item on top of each stack, created when
	 * the first such stack is found.
	 */
	private readonly children: (Map<any, number> | undefined)[];

	public constructor() {
		this.children = [ undefined ];
	}

	/**
	 * Get the number of the stack that has the given item on top of the
	 * stack with the given number.
	 *
	 * @param below -
	 *   the number of the stack below the item, `0` for the empty stack
	 * @param item -
	 *   the item on top
	 * @returns
	 *   the number of the stack
	 */
	public push(below: number, item: any): number {
		if(item !== null && typeof item === 'object' && item[unreadData] === true) {
			return below;
		}

		let children = this.children[below];
		if(! children) {
			children = new Map();
			this.children[below] = children;
		}

		let id = children.get(item);
		if(id === undefined) {
			id = this.children.length;
			this.children.push(undefined);
			children.set(item, id);
		}

		return id;
	}
}

/**
 * The highest token index that states are kept for. The index is a part of
 * the key of a state.
 */
const INDEX_LIMIT = 65536;

/**
 * The states that paths reached nodes in, for one frame. A frame is the
 * evaluation of the graph with one match handler: the whole match, or one
 * pass over a sub-graph, or one length of a value. Matches go to the same
 * handler in a frame, so a path that is not better than an earlier path in
 * the same state can not change what the handler keeps.
 */
export class MemoFrame {
	/**
	 * The entries for each data stack, and for each node and token index.
	 * The entries of the expression that can not continue after the input
	 * ends are kept apart.
	 */
	private entries: Map<number, Map<number, MemoEntry>> | null;
	private entriesWithoutContinuation: Map<number, Map<number, MemoEntry>> | null;

	/**
	 * If the last call to `find` created the entry.
	 */
	public created: boolean;

	public constructor() {
		this.created = false;
		// Created when they are first used, as many frames are never used
		this.entries = null;
		this.entriesWithoutContinuation = null;
	}

	/**
	 * Find the entry for the state a path reached a node in, and create it if
	 * it does not exist.
	 *
	 * @param nodeId -
	 *   the number of the node, from `Node.sharedId`
	 * @param index -
	 *   the token index
	 * @param allowContinuation -
	 *   if the expression can continue after the input ends
	 * @param dataId -
	 *   the number of the data stack, from `DataStackIds`
	 * @param score -
	 *   the score of the path, used for a new entry
	 * @returns
	 *   the entry, `created` tells if it is new, or `undefined` if the index
	 *   is too high to keep states for
	 */
	public find(
		nodeId: number,
		index: number,
		allowContinuation: boolean,
		dataId: number,
		score: number
	): MemoEntry | undefined {
		if(index >= INDEX_LIMIT) return undefined;

		this.entries ??= new Map();
		this.entriesWithoutContinuation ??= new Map();
		const byData = allowContinuation ? this.entries : this.entriesWithoutContinuation;
		let states = byData.get(dataId);
		if(! states) {
			states = new Map();
			byData.set(dataId, states);
		}

		const key = (nodeId * INDEX_LIMIT) + index;
		let entry = states.get(key);
		if(entry) {
			this.created = false;
			return entry;
		}

		entry = {
			score: score,
			walkScore: score,
			walkScores: null,
			active: 0,
			seedUses: null,
			cutOff: false,
			depth: 0,
			records: null
		};
		states.set(key, entry);
		this.created = true;
		return entry;
	}
}

/**
 * The number to give the next node that more than one edge leads to. Two
 * paths can only reach the same node in the same state after they meet,
 * and paths only meet at such a node, so other nodes are not looked up.
 */
let nextSharedId = 0;

/**
 * Find the nodes of a graph that more than one edge leads to, and give each
 * of them a number in `Node.sharedId`. The walk does not go into the
 * sub-graphs that nodes refer to, so only the graph itself is changed.
 *
 * Call this for graphs where paths often meet, such as the graph of phrases
 * with groups. A graph that is not scanned is matched without keeping
 * states, as for most graphs keeping states costs more than it saves.
 *
 * @param roots -
 *   the root nodes of the graph
 */
export function scanSharedNodes(roots: Node[]): void {
	const incoming = new Map<Node, number>();
	const lists: Node[][] = [ roots ];
	const seenLists = new Set<Node[]>();
	while(lists.length > 0) {
		const list = lists.pop() as Node[];
		if(seenLists.has(list)) continue;
		seenLists.add(list);

		for(const node of list) {
			const count = incoming.get(node) ?? 0;
			incoming.set(node, count + 1);
			if(count === 0) lists.push(node.outgoing);
		}
	}

	for(const [ node, count ] of incoming) {
		if(count > 1 && node.sharedId < 0) node.sharedId = nextSharedId++;
	}
}
