import { deepEqual } from 'fast-equals';

import { Node, Encounter } from '@ecolect/graph';

/**
 * Node that represents a value that isn't extracted from text, but instead
 * is always present if a match occurs later.
 */
export class ValueStatic<V> extends Node {
	private id: string;
	private value: V;

	public constructor(id: string, value: V) {
		super();

		this.id = id;
		this.value = value;
	}

	public equals(o: Node): boolean {
		return o instanceof ValueStatic && this.id === o.id
			&& deepEqual(this.value, o.value);
	}

	public match(encounter: Encounter) {
		return encounter.next(0, 0, { id: this.id, value: this.value });
	}

	public toString() {
		return 'ValueStatic[' + this.id + '=' + this.value + ']';
	}
}
