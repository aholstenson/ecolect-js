import { Encounter } from './matching/Encounter.js';
import { MaybePromise } from './matching/maybePromise.js';

/**
 * The base class for nodes.
 */
export abstract class Node {
	public outgoing: Node[];
	public supportsPunctuation: boolean;

	public constructor() {
		this.outgoing = [];
		this.supportsPunctuation = false;
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
