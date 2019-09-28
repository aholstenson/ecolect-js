import { Encounter } from './matching/encounter';

/**
 * The base class for nodes.
 */
export abstract class Node {
	public outgoing: Node[];
	public supportsPunctuation: boolean;

	constructor() {
		this.outgoing = [];
		this.supportsPunctuation = false;
	}

	public abstract match(encounter: Encounter): void | Promise<any>;

	public abstract equals(other: Node): boolean;
}
