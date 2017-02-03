'use strict';

const Node = require('./node');
const ALWAYS_TRUE = () => true;

class SubNode extends Node {
	constructor(roots, filter) {
		super();

		this.filter = filter || ALWAYS_TRUE;

		if(roots instanceof Node) {
			// This node probably points to another parser
			this.roots = roots.outgoing;
			this.supportsPartial = typeof roots.supportsPartial !== 'undefined' ? roots.supportsPartial : true;
			this.name = roots._name || null;
			this.skipPunctuation = typeof roots._skipPunctuation !== 'undefined' ? roots._skipPunctuation : null;
			this.fuzzy = typeof roots._fuzzy !== 'undefined' ? roots._fuzzy : null;
			this.state = roots._cache;
		} else {
			this.roots = roots;
			this.state = this;
		}
	}

	match(encounter) {
		if(this.state.currentIndex === encounter.currentIndex) {
			/*
			 * If this node is called with the same index again we skip
			 * evaulating.
			 */
			return null;
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
				return null;
			}
		}

		// Set the index we were called at
		let previousIndex = this.state.currentIndex;
		this.state.currentIndex = encounter.currentIndex;

		const variants = [];
		const branchIntoVariants = variants0 => {
			let result = [];
			let promise = Promise.resolve();
			variants0.forEach(v => {
				if(! this.filter(v.data)) return;

				promise = promise.then(() => {
					return encounter.next(
						v.score - encounter.currentScore,
						v.index - encounter.currentIndex,
						v.data
					).then(r => result.push(...r));
				});
			});

			return promise.then(() => {
				this.state.currentIndex = previousIndex;
				if(result.length === 0) {
					return null;
				} else if(result.length === 1) {
					return result[0];
				} else {
					return result;
				}
			});
		};

		// Check the cache
		const cache = encounter.cache();
		let cached = cache.get(this.roots);
		if(cached) {
			return branchIntoVariants(cached);
		}

		const onMatch = result => {
			if(this.mapper && result !== null && typeof result !== 'undefined') {
				result = this.mapper(result, encounter);
			}

			variants.push({
				index: encounter.currentIndex,
				score: encounter.currentScore,
				data: result
			});
		};

		// Memorize if we are running a partial match
		const partial = encounter.partial;
		const skipPunctuation = encounter.skipPunctuation;
		const fuzzy = encounter.fuzzy;

		return encounter.branchWithOnMatch(onMatch, () => {
			if(partial && ! this.supportsPartial) {
				// If we do not support partial matching
				encounter.partial = false;
			}

			if(this.skipPunctuation != null) {
				encounter.skipPunctuation = this.skipPunctuation;
			}

			if(this.fuzzy != null) {
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
			if(a.length != b.length) return false;
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
}

module.exports = SubNode;
