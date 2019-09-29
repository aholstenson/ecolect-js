import { isDeepEqual } from '../utils/equality';

import { Node } from '../graph/Node';
import { SubNode } from '../graph/SubNode';
import { Encounter } from '../graph/matching';
import { Graph } from '../graph/Graph';

export interface ValueParserOptions<V, O> {
	/**
	 * If the partial should be presented as a blank value if it is being
	 * matched and no more tokens are available.
	 */
	partialBlankWhenNoToken?: boolean;

	mapper: (data: V, encounter: Encounter) => O;
}

export class ValueParserNode<V> extends Node {
	public readonly id: string;
	private node: SubNode<V>;
	private options: ValueParserOptions<V, any>;

	private partialBlankWhenNoToken: boolean;

	constructor(id: string, graph: Graph<V>, options: ValueParserOptions<V, any>) {
		super();

		this.id = id;
		this.node = new SubNode(graph, graph.options);
		this.options = options;

		this.partialBlankWhenNoToken = ! this.node.supportsPartial || options.partialBlankWhenNoToken || false;

		/*
		 * Make sure that the result of evaluating this sub-graph is mapped
		 * using the same mapper as would be used if graph is directly matched
		 * on.
		 */
		this.node.partialFallback = {
			id: this.id,
		};
		this.node.mapper = (r, encounter) => {
			// Map it into a value format
			return {
				id: id,
				value: options.mapper(r, encounter)
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
