'use strict';

const Node = require('./node');

class Collector extends Node {
	constructor(depth, value) {
		super();

		this.depth = depth;
		this.value = value;
	}

	match(encounter) {
		let value = this.value;
		if(typeof value === 'function') {
			let data = encounter.data;
			if(data.length > this.depth) {
				data = data.slice(data.length - this.depth);
			}
			value = value(data);
		}

		const promise = encounter.match(value);
		if(promise) {
			return promise;
		}

		return value;
	}

	toString() {
		return 'Collector[' + this.value + ']';
	}
}

module.exports = Collector;
