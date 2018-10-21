import { isDeepEqual } from '../utils/equality';

import Node from '../graph/node';
import SubNode from '../graph/sub';

export default class ValueParser extends Node {
	constructor(id, matcher, options={}) {
		super();

		this.id = id;
		this.node = new SubNode(matcher, matcher.options);
		this.options = options;

		this.partialBlankWhenNoToken = ! this.node.supportsPartial || options.partialBlankWhenNoToken;

		/*
		 * Make sure that the result of evaluating this sub-graph is mapped
		 * using the same mapper as would be used if graph is directly matched
		 * on.
		 */
		const mapper = matcher.options.mapper;
		this.node.partialFallback = {
			id: this.id,
		};
		this.node.mapper = (r, encounter) => {
			if(mapper) {
				// Perform the mapping using the graphs mapper
				r = mapper(r, encounter);
			}

			// Map it into a value format
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
		if(! encounter.token() && encounter.initialPartial && this.partialBlankWhenNoToken
			&& (! this.node.supportsPartial || ! encounter.isJustAfterLastToken)) {
			/*
			* If there are no more tokens and the value does not support
			* partial matches push a partial value.
			*/
			return encounter.next(0, 0, this.node.partialFallback);
		}

		return this.node.match(encounter);
	}

	toString() {
		return 'ValueParser[' + this.id + ']';
	}
}
