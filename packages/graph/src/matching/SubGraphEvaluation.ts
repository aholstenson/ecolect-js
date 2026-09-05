import { Node } from '../Node.js';

/**
 * A way a sub-graph can match starting at a certain token. Sub-graphs can
 * match in several ways, such as matching `T2` or `T2 T3`, and every way is
 * kept as a variant so that the nodes after the sub-graph can be evaluated
 * for each of them.
 */
export interface SubGraphVariant {
	/**
	 * Index of the token after the last token the sub-graph consumed.
	 */
	index: number;

	/**
	 * Score of the variant, relative to where the sub-graph started.
	 */
	score: number;

	/**
	 * Data collected by the sub-graph, as reported by the sub-graph.
	 */
	data: any;
}

/**
 * Evaluation of a sub-graph that is in progress at a certain token index.
 *
 * Sub-graphs may refer to themselves, such as a number graph that combines
 * two numbers into one. When such a graph is evaluated and it reaches itself
 * at the same index it can not be evaluated again, as that would go on
 * forever. Instead the variants found so far are used as a seed, and the
 * graph is evaluated again until the seed stops growing.
 */
export interface SubGraphEvaluation {
	/**
	 * The root nodes of the sub-graph being evaluated.
	 */
	readonly roots: Node[];

	/**
	 * The index of the token the evaluation started at.
	 */
	readonly index: number;

	/**
	 * The depth of the node stack of the encounter when the evaluation
	 * started. The node at this depth is the root node being evaluated.
	 */
	readonly depth: number;

	/**
	 * The variants found so far.
	 */
	readonly seed: SubGraphVariant[];

	/**
	 * If the seed has been used by the sub-graph referring to itself during
	 * the current pass. When it has and the seed grew the sub-graph needs
	 * another pass.
	 */
	seedUsed: boolean;

	/**
	 * The root nodes that led to the seed being used during the current
	 * pass. Only these roots can find new variants when the seed grows.
	 */
	readonly seedRoots: Set<Node>;

	/**
	 * If the result of this evaluation depends on the seed of another
	 * evaluation that is still in progress. Such results are not complete
	 * and must not be cached.
	 */
	dependsOnSeed: boolean;
}
