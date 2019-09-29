import { Node } from './Node';
import { Matcher, MatcherOptions, Encounter, Match, MatchingState, emptyState } from './matching';
import { Predicate, alwaysTruePredicate } from '../utils/predicates';

/*
 * Small penalty applied when a SubNode matches. This helps the algorithm
 * prefer less parser matches. So if a parser P1 can match (A | A B) and
 * another one P1 matches (B) this penalty helps cases where P1 is followed
 * by an optional P2 to match P1 before before P1 P2.
 */
const PARSER_PENALTY = 0.001;

/**
 * A variant as resolved by the sub-graph. Used for caching of data.
 */
interface Variant {
	index: number;
	score: number;
	data: any;
}

/**
 * Node that points to a sub-graph that should be evaluated as part of another
 * graph. This type of node will resolve all variants it can starting from the
 * current token working forwards.
 *
 * Given the tokens `T1 T2 T3 T4 T5 T6` and a match starting at T2 this node
 * may return with variants that span `T2` and `T2 T3` in which case the next
 * nodes will be evaluated both against both matches, so it will be invoked
 * once starting from `T3` and once from `T4`.
 */
export class SubNode<V> extends Node {
	private roots: Node[];
	private state: MatchingState;

	public name: string;

	public recursive: boolean;
	public supportsPartial: boolean;
	private skipPunctuation: boolean;
	private supportsFuzzy: boolean;

	private filter: Predicate<V>;
	public mapper: ((result: any, encounter: Encounter) => any) | undefined;

	/**
	 * Fallback value to apply in case this is a partial match and the graph
	 * doesn't fully match.
	 */
	public partialFallback?: any;

	constructor(roots: Matcher<V> | Node[], options: MatcherOptions<V>, filter?: Predicate<V>) {
		super();

		this.recursive = false;
		this.filter = filter || alwaysTruePredicate;

		if(roots instanceof Matcher) {
			// Roots is actually a matcher, copy the graph from the matcher
			this.roots = roots.nodes;
			this.state = roots.matchingState;
		} else {
			this.roots = roots;
			this.state = emptyState();
		}

		this.supportsPartial = options.supportsPartial || false;
		this.name = options.name || 'unknown';
		this.skipPunctuation = options.skipPunctuation || false;
		this.supportsFuzzy = options.supportsFuzzy || false;
		//this.mapper = options.mapper;
	}

	public match(encounter: Encounter) {
		if(this.state.currentIndex === encounter.currentIndex) {
			/*
			 * If this node is called with the same index again we skip
			 * evaluating.
			 */
			return;
		}

		if(! encounter.token() && encounter.options.partial) {
			if(this.recursive) {
				/**
				 * If this evaluating a recursive match on a partial encounter
				 * skip it.
				 */
				return;
			}

			if(! this.supportsPartial) {
				/**
				 * Partial match for nothing without support for it. Assume
				 * we will match in the future.
				 */
				return;
			}
		}

		// Set the index we were called at
		const previousIndex = this.state.currentIndex;
		this.state.currentIndex = encounter.currentIndex;

		const variants: Variant[] = [];
		const branchIntoVariants = (variants0: Variant[]) => {
			let promise;

			if(variants0.length === 0) {
				if(encounter.options.partial && ! this.supportsPartial && this.partialFallback) {
					promise = encounter.next(0.0, encounter.tokens.length - encounter.currentIndex, this.partialFallback);
				} else {
					promise = Promise.resolve();
				}
			} else {
				promise = Promise.resolve();

				for(let i=0; i<variants0.length; i++) {
					const v = variants0[i];
					if(v.data !== null && ! this.filter(v.data)) {
						continue;
					}

					promise = promise.then(() => {
						return encounter.next(
							v.score - PARSER_PENALTY,
							v.index - encounter.currentIndex,
							v.data
						);
					});
				}
			}

			return promise.then(() => {
				this.state.currentIndex = previousIndex;
			});
		};

		// Check the cache
		const cache = encounter.cache();
		const cached = cache.get(this.roots);
		if(cached) {
			return branchIntoVariants(cached);
		}

		const baseScore = encounter.currentScore;
		const onMatch = (match: Match<V>) => {
			let result: V | null = match.data;
			if(result !== null && typeof result !== 'undefined') {
				if(this.mapper) {
					result = this.mapper(result, encounter);
				}
			} else {
				result = null;
			}

			variants.push({
				index: match.index,
				score: encounter.currentScore - baseScore,
				data: result
			});

			// Back-track to allow following nodes to also handle any trailing tokens
			const previousNonSkipped = encounter.previousNonSkipped();
			if(previousNonSkipped !== match.index) {
				variants.push({
					index: previousNonSkipped,
					score: encounter.currentScore - baseScore,
					data: result
				});
			}
		};

		// Memorize if we are running a partial match
		const supportsPartial = encounter.supportsPartial;
		const supportsFuzzy = encounter.supportsFuzzy;
		const skipPunctuation = encounter.skipPunctuation;

		return encounter.branchWithOnMatch(onMatch, () => {
			encounter.supportsPartial = this.supportsPartial;
			encounter.supportsFuzzy = this.supportsFuzzy;
			encounter.skipPunctuation = this.skipPunctuation;

			return encounter.branchInto(this.roots);
		}).then(() => {
			// Switch back to previous supported values
			encounter.supportsPartial = supportsPartial;
			encounter.supportsFuzzy = supportsFuzzy;
			encounter.skipPunctuation = skipPunctuation;

			cache.set(this.roots, variants);
			return branchIntoVariants(variants);
		});
	}

	public equals(other: Node): boolean {
		function arrayEquals<E>(a: E[], b: E[]) {
			if(a.length !== b.length) return false;
			for(let i=0; i<a.length; i++) {
				if(a !== b) return false;
			}
			return true;
		}

		return other instanceof SubNode
			&& arrayEquals(this.roots, other.roots)
			&& this.filter === other.filter;
	}

	public toString() {
		return 'SubGraph[' + (this.name || this.roots) + ']';
	}

	public toDot() {
		if(this.name === 'Self') {
			return 'shape=circle, label=""';
		} else {
			return 'shape=rectangle, label="' + (this.name || '') + '"';
		}
	}
}
