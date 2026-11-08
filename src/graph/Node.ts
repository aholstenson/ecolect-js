import type { Encounter } from './matching/Encounter.js';
import type { MaybePromise } from './matching/maybePromise.js';

/**
 * The base class for nodes.
 */
export abstract class Node {
	public outgoing: Node[];
	public supportsPunctuation: boolean;

	/**
	 * If this node reads any text, such as a free-text value. A word that
	 * may be left out is not skipped before such a node, as the node can
	 * read the word itself.
	 */
	public readsAnyText: boolean;

	/**
	 * The number the matcher uses for this node when more than one edge leads
	 * to it, else `-1`. Set by `scanSharedNodes` for graphs of phrases.
	 */
	public sharedId: number;

	public constructor() {
		this.outgoing = [];
		this.supportsPunctuation = false;
		this.readsAnyText = false;
		this.sharedId = -1;
	}

	/**
	 * Match this node against the current token of the encounter. Nodes
	 * that match call `encounter.advance` to evaluate the nodes after them.
	 *
	 * @param encounter -
	 *   the encounter being matched
	 * @returns
	 *   nothing, or a promise if matching needs asynchronous work
	 */
	public abstract match(encounter: Encounter): MaybePromise<unknown>;

	public abstract equals(other: Node): boolean;
}
