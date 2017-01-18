'use strict';

const Node = require('./node');

class Collector extends Node {
	constructor(data) {
		super();

		this.data = data;
	}

	match(encounter) {
		if(encounter.tokens.length == encounter.currentIndex || encounter.partial) {
			encounter.match(this.data);
			return true;
		}

		return false;
	}

	toString() {
		return 'Collector';
	}
}

module.exports = Collector;
