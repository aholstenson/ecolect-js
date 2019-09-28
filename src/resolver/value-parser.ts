import { isDeepEqual } from '../utils/equality';

import { Node } from '../graph/node';
import { SubNode } from '../graph/sub';
import { Matcher, Encounter } from '../graph/matching';

export interface ValueParserOptions {
	/**
	 * If the partial should be presented as a blank value if it is being
	 * matched and no more tokens are available.
	 */
	partialBlankWhenNoToken?: boolean;
}

export class ValueParserNode<V> extends Node {
	public readonly id: string;
	private node: SubNode<V>;
	private options: ValueParserOptions;

	private partialBlankWhenNoToken: boolean;

	constructor(id: string, matcher: Matcher<V>, options: ValueParserOptions={}) {
		super();

		this.id = id;
		this.node = new SubNode(matcher, matcher.options);
		this.options = options;

		this.partialBlankWhenNoToken = ! this.node.supportsPartial || options.partialBlankWhenNoToken || false;

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
				value: r//options.mapper ? options.mapper(r) : r
			};
		};
	}

	public equals(o: Node): boolean {
		return o instanceof ValueParserNode && this.node.equals(o.node)
			&& isDeepEqual(this.options, o.options);
	}

	public match(encounter: Encounter) {
		if(! encounter.token() && encounter.options.partial && this.partialBlankWhenNoToken
			&& (! this.node.supportsPartial || ! encounter.isJustAfterLastToken)) {
			/*
			* If there are no more tokens and the value does not support
			* partial matches push a partial value.
			*/
			return encounter.next(0, 0, this.node.partialFallback);
		}

		return this.node.match(encounter);
	}

	public toString() {
		return 'ValueParser[' + this.id + ']';
	}
}
