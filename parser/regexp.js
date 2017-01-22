'use strict';

const Node = require('./node');

class RegExpNode extends Node {
	constructor(regexp) {
		super();

		this.regexp = regexp;
	}

	match(encounter) {
		const token = encounter.token();
		if(! token) return null;

		this.regexp.previousIndex = 0;
		const match = this.regexp.exec(token.raw);
		if(! match) return null;

		return encounter.next(1, 1, match[0]);
	}

	equals(other) {
		return other instanceof RegExpNode && this.regexp.source === other.regexp.source;
	}

	toString() {
		return 'RegExp[' + this.regexp + ']';
	}
}

module.exports = RegExpNode;
