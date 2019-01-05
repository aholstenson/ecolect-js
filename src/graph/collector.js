import Node from './node';


/**
 * Node that generates a match based on the current values.
 */
export default class Collector extends Node {
	constructor(depth, value) {
		super();

		this.depth = depth;
		this.value = value;
	}

	match(encounter) {
		let value = this.value;
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
			value = value(data, encounter);
		}

		if(typeof value !== 'undefined' && value !== null) {
			// If the value is not undefined or null count it as a match
			return encounter.match(value);
		}
	}

	toString() {
		return 'Collector[' + this.value + ']';
	}

	toDot() {
		return 'shape=diamond, label=""';
	}
}
