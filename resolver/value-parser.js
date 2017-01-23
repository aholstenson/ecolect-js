'use strict';

const Node = require('../parser/node');
const SubNode = require('../parser/sub');

class ValueParser extends Node {
	constructor(id, parser) {
		super();

		this.id = id;
		this.node = new SubNode(parser);

		const mapper = this.node.mapper;
		this.node.mapper = r => {
			r = mapper ? mapper(r) : r;
			return {
				id: id,
				value: r
			};
		};
	}

	match(encounter) {
		return this.node.match(encounter);
	}

	toString() {
		return 'ValueParser[' + this.id + ']';
	}
}

module.exports = ValueParser;
