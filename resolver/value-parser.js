'use strict';

const Node = require('../parser/node');
const SubNode = require('../parser/sub');

class ValueParser extends Node {
	constructor(id, parser, options) {
		super();

		this.id = id;
		this.node = new SubNode(parser);
		this.options = options;

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
		return this.node.match(encounter, this.options);
	}

	toString() {
		return 'ValueParser[' + this.id + ']';
	}
}

module.exports = ValueParser;
