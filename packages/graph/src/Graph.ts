import { Tokenizer } from '@ecolect/tokenization';

import { GraphOptions } from './GraphOptions';
import { MatchingState } from './matching';
import { Node } from './Node';

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

	/**
	 * Internal state of this matcher that is accessed if it is used as a
	 * sub graph.
	 */
	readonly matchingState: MatchingState;
}
