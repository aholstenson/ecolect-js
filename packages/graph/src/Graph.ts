import { Tokenizer } from '@ecolect/tokenization';

import { GraphOptions } from './GraphOptions.js';
import { Node } from './Node.js';

/**
 * Graph that has been built via GraphBuilder. Graphs are a collection of
 * outgoing nodes that can parse an expression.
 */
export interface Graph<DataType> {
	readonly tokenizer: Tokenizer;

	/**
	 * The outgoing nodes of this graph.
	 */
	readonly nodes: Node[];

	/**
	 * Options to apply during matching of this graph.
	 */
	readonly options: GraphOptions;
}
