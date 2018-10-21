import { isDeepEqual } from '../utils/equality';

import Node from '../graph/node';

export default class ValueStatic extends Node {
	constructor(id, value) {
		super();

		this.id = id;
		this.value = value;
	}

	equals(o) {
		return o instanceof ValueStatic && this.id.equals(o.id)
			&& isDeepEqual(this.value, o.value);
	}

	match(encounter) {
		return encounter.next(0, 0, { id: this.id, value: this.value });
	}

	toString() {
		return 'ValueStatic[' + this.id + '=' + this.value + ']';
	}
}
