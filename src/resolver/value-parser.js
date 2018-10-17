import { isDeepEqual } from '../utils/equality';

import Node from '../graph/node';
import SubNode from '../graph/sub';

export default class ValueParser extends Node {
	constructor(id, matcher, options={}) {
		super();

		this.id = id;
		this.node = new SubNode(matcher);
		this.options = options;

		const mapper = matcher.mapper;
		this.node.mapper = (r, encounter) => {
			r = mapper ? mapper(r, encounter) : r;
			return {
				id: id,
				value: options.mapper ? options.mapper(r) : r
			};
		};
	}

	equals(o) {
		return o instanceof ValueParser && this.node.equals(o.node)
			&& isDeepEqual(this.options, o.options);
	}

	match(encounter) {
		return this.node.match(encounter);
	}

	toString() {
		return 'ValueParser[' + this.id + ']';
	}
}
