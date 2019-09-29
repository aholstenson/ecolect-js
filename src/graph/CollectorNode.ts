import { Node } from './Node';
import { Encounter } from './matching';

/**
 * Function that can resolve a value given data collected during graph
 * evaluation.
 */
export type ValueResolver<V> = (data: any[], encounter: Encounter) => V | null;

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

	constructor(depth: number, value: Collectable<V>) {
		super();

		this.depth = depth;
		this.value = value;
	}

	public match(encounter: Encounter) {
		let value: Collectable<V> | null = this.value;
		if(typeof value === 'function') {
			/**
			 * For the case where the value is a function to be invoked slice
			 * the data based on the number of nodes used. This allows the
			 * parsers to use zero-based indexing instead of length - idx.
			 */
			let data = encounter.data();
			if(data.length > this.depth && data.length > 0) {
				data = data.slice(data.length - this.depth);
			}
			value = (value as ValueResolver<V>)(data, encounter);
		}

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
