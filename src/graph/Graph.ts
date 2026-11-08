import type { Tokenizer } from '../tokenization/index.js';

import type { GraphOptions } from './GraphOptions.js';
import type { Node } from './Node.js';

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
