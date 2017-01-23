'use strict';

const Node = require('./node');

class Collector extends Node {
	constructor(depth, value, needsAll) {
		super();

		this.depth = depth;
		this.value = value;
		this.needsAll = needsAll;
	}

	match(encounter) {
		let value = this.value;
		if(typeof value === 'function') {
			let data = encounter.data;
			if(data.length > this.depth && encounter.data.length > 0) {
				data = data.slice(data.length - this.depth);
			}
			value = value(data, encounter);
		}

		if(this.needsAll && encounter.currentIndex < encounter.tokens.length) {
			// Not all tokens have been matched so skip this result
			return null;
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
