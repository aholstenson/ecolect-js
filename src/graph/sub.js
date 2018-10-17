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
	constructor(roots, filter) {
		super();

		this.filter = filter || ALWAYS_TRUE;

		if(roots instanceof Matcher) {
			// Roots is actually a matcher, copy the graph from the matcher
			this.roots = roots.nodes;
			this.supportsPartial = typeof roots.supportsPartial !== 'undefined' ? roots.supportsPartial : null;
			this.name = roots.name || null;
			this.skipPunctuation = typeof roots.skipPunctuation !== 'undefined' ? roots.skipPunctuation : null;
			this.fuzzy = typeof roots.fuzzy !== 'undefined' ? roots.fuzzy : null;
			this.state = roots._cache;
		} else {
			this.roots = roots;
			this.state = this;
			this.supportsPartial = null;
			this.fuzzy = null;
			this.skipPunctuation = null;
		}
	}

	match(encounter) {
		if(this.state.currentIndex === encounter.currentIndex) {
			/*
			 * If this node is called with the same index again we skip
			 * evaulating.
			 */
			return;
		}

		if(! encounter.token()) {
			if(encounter.partial) {
				if(! this.supportsPartial) {
					/**
					* Partial match for nothing without support for it. Assume
					* we will match in the future.
					*/
					return encounter.next(1.0, 0);
				}
			} else if(this.supportsPartial) {
				/**
				 * No tokens means we can't match.
				 */
				return;
			}
		}

		// Set the index we were called at
		let previousIndex = this.state.currentIndex;
		this.state.currentIndex = encounter.currentIndex;

		const variants = [];
		const branchIntoVariants = variants0 => {
			let promise = Promise.resolve();
			for(let i=0; i<variants0.length; i++) {
				const v = variants0[i];
				if(! this.filter(v.data)) continue;

				promise = promise.then(() => {
					return encounter.next(
						v.score - encounter.currentScore - PARSER_PENALTY,
						v.index - encounter.currentIndex,
						v.data
					);
				});
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

		const onMatch = match => {
			let result = match.data;
			if(this.mapper && result !== null && typeof result !== 'undefined') {
				result = this.mapper(result, encounter);
			}

			variants.push({
				index: match.index,
				score: encounter.currentScore,
				data: result
			});

			// Back-track to allow following nodes to also handle any trailing tokens
			const previousNonSkipped = encounter.previousNonSkipped();
			if(previousNonSkipped !== match.index) {
				variants.push({
					index: previousNonSkipped,
					score: encounter.currentScore,
					data: result
				});
			}
		};

		// Memorize if we are running a partial match
		const partial = encounter.partial;
		const skipPunctuation = encounter.skipPunctuation;
		const fuzzy = encounter.fuzzy;

		return encounter.branchWithOnMatch(onMatch, () => {
			if(partial && this.supportsPartial !== null) {
				encounter.partial = this.supportsPartial;
			}

			if(this.skipPunctuation !== null) {
				encounter.skipPunctuation = this.skipPunctuation;
			}

			if(this.fuzzy !== null) {
				encounter.fuzzy = this.fuzzy;
			}

			return encounter.next(this.roots);
		}).then(() => {
			// Restore partial flag
			encounter.partial = partial;
			encounter.skipPunctuation = skipPunctuation;
			encounter.fuzzy = fuzzy;

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