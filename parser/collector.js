'use strict';

const Node = require('./node');

class Collector extends Node {
	constructor(value) {
		super();

		this.value = value;
	}

	match(encounter) {
		let value = this.value;
		if(typeof value === 'function') {
			value = value(encounter.data);
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
