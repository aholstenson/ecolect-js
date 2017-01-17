'use strict';

class Node {
	constructor() {
		this.outgoing = [];
	}

	next(encounter, score, consumedTokens) {
		return encounter.next(score, consumedTokens || 1, this.outgoing);
	}
}

module.exports = Node;
