import { Node } from './Node';
import { MatchingState } from './matching';
import { GraphOptions } from './GraphOptions';

/**
 * Graph that has been built via GraphBuilder. Graphs are a collection of
 * outgoing nodes that can parse an expression.
 */
export interface Graph<DataType> {
	/**
	 * The outgoing nodes of this graph.
	 */
	nodes: Node[];

	/**
	 * Options to apply during matching of this graph.
	 */
	options: GraphOptions;

	/**
	 * Internal state of this matcher that is accessed if it is used as a
	 * sub graph.
	 */
	matchingState: MatchingState;
}
