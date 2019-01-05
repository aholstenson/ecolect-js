import Node from './node';
import Matcher from './matching/matcher';

const ALWAYS_TRUE = () => true;

/*
 * Small penalty applied when a SubNode matches. This helps the algorithm
 * prefer less parser matches. So if a parser P1 can match (A | A B) and
 * another one P1 matches (B) this penalty helps cases where P1 is followed
 * by an optional P2 to match P1 before before P1 P2.
 */
const PARSER_PENALTY = 0.001;

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
export default class SubNode extends Node {
	constructor(roots, options, filter) {
		super();

		this.filter = filter || ALWAYS_TRUE;

		if(roots instanceof Matcher) {
			// Roots is actually a matcher, copy the graph from the matcher
			this.roots = roots.nodes;
			this.state = roots._cache;
		} else {
			this.roots = roots;
			this.state = options.state || this;
		}

		this.supportsPartial = options.supportsPartial || false;
		this.name = options.name || null;
		this.skipPunctuation = options.skipPunctuation || false;
		this.supportsFuzzy = options.supportsFuzzy || false;
	}

	match(encounter) {
		if(this.state.currentIndex === encounter.currentIndex) {
			/*
			 * If this node is called with the same index again we skip
			 * evaulating.
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

		const variants = [];
		const branchIntoVariants = variants0 => {
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
		let cached = cache.get(this.roots);
		if(cached) {
			return branchIntoVariants(cached);
		}

		const baseScore = encounter.currentScore;
		const onMatch = match => {
			let result = match.data;
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

	equals(other) {
		function arrayEquals(a, b) {
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

	toString() {
		return 'SubGraph[' + (this.name || this.roots) + ']';
	}

	toDot() {
		if(this.name === 'Self') {
			return 'shape=circle, label=""';
		} else {
			return 'shape=rectangle, label="' + (this.name || '') + '"';
		}
	}
}
