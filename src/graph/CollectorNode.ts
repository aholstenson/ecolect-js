import { Encounter, EncounterOptions } from './matching/index.js';
import { Node } from './Node.js';

/**
 * Function that can resolve a value given data collected during graph
 * evaluation.
 */
export type ValueResolver<V> = (data: any[], options: any, encounter: Encounter) => V | null;

/**
 * Collectable value, either a value or a function to invoke to receive the
 * value.
 */
export type Collectable<V> = V | ValueResolver<V>;

/**
 * Node that generates a match based on the current values.
 */
export class CollectorNode<V> extends Node {
	private depth: number;
	private value: Collectable<V>;

	public constructor(depth: number, value: Collectable<V>) {
		super();

		this.depth = depth;
		this.value = value;
	}

	/**
	 * Resolve the value this node collects.
	 *
	 * @param data -
	 *   the data collected by the nodes before this one
	 * @param options -
	 *   the options of the match
	 * @param encounter -
	 *   the encounter being matched, if there is one
	 * @returns
	 *   the value, or `null` if the data does not resolve to one
	 */
	public resolve(data: any[] = [], options: any = {}, encounter?: Encounter): V | null {
		const value: Collectable<V> = this.value;
		if(typeof value !== 'function') {
			return value;
		}

		/**
		 * For the case where the value is a function to be invoked slice
		 * the data based on the number of nodes used. This allows the
		 * parsers to use zero-based indexing instead of length - idx.
		 */
		let sliced = data;
		if(sliced.length > this.depth && sliced.length > 0) {
			sliced = sliced.slice(sliced.length - this.depth);
		}

		return (value as ValueResolver<V>)(sliced, options, encounter as Encounter) ?? null;
	}

	public match(encounter: Encounter) {
		const value = this.resolve(encounter.data(), encounter.options, encounter);

		if(typeof value !== 'undefined' && value !== null) {
			// If the value is not undefined or null count it as a match
			return encounter.match(value);
		}
	}

	public equals(other: Node): boolean {
		return other instanceof CollectorNode
			&& other.depth === this.depth
			&& other.value === this.value;
	}

	public toString() {
		return 'Collector[' + this.value + ']';
	}

	public toDot() {
		return 'shape=diamond, label=""';
	}
}
