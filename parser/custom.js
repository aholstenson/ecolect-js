'use strict';

const Node = require('./node');

class CustomNode extends Node {
	constructor(validator) {
		super();

		this.validator = validator;
	}

	match(encounter) {
		const token = encounter.token();
		if(! token) return null;

		return Promise.resolve(this.validator(token))
			.then(r => {
				if(typeof r !== 'undefined' && r != null) {
					return encounter.next(1, 1, r);
				}
			});
	}

	equals(other) {
		return other instanceof CustomNode && this.validator === other.validator;
	}
}

module.exports = CustomNode;
