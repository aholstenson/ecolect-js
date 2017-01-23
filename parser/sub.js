'use strict';

const Node = require('./node');
const ALWAYS_TRUE = () => true;

class SubNode extends Node {
	constructor(roots, filter) {
		super();

		this.roots = roots instanceof Node ? roots.outgoing : roots;
		this.filter = filter || ALWAYS_TRUE;
		this.mapper = roots instanceof Node ? roots._mapper : null;
		this.supportsPartial = roots instanceof Node && typeof roots.supportsPartial !== 'undefined' ? roots.supportsPartial : true;
	}

	match(encounter) {
		if(this.currentIndex === encounter.currentIndex) {
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
			} else if(this.supports) {
				/**
				 * No tokens means we can't match.
				 */
				return null;
			}
		}

		const variants = [];
		const onMatch = result => {
			if(! this.filter(result)) return;

			if(this.mapper && result !== null && typeof result !== 'undefined') {
				result = this.mapper(result);
			}

			variants.push({
				index: encounter.currentIndex,
				score: encounter.currentScore,
				data: result
			});
		};

		// Set the index we were called at
		let previousIndex = this.currentIndex;
		this.currentIndex = encounter.currentIndex;

		// Memorize if we are running a partial match
		const partial = encounter.partial;

		return encounter.branchWithOnMatch(onMatch, () => {
			if(partial && ! this.supportsPartial) {
				// If we do not support partial matching
				encounter.partial = false;
			}
			return encounter.next(this.roots);
		}).then(() => {
			// Restore partial flag
			encounter.partial = partial;

			let result = [];
			let promise = Promise.resolve();
			variants.forEach(v => promise = promise.then(() => {
				return encounter.next(
					v.score - encounter.currentScore,
					v.index - encounter.currentIndex,
					v.data
				).then(r => result.push(...r));
			}));

			return promise.then(() => {
				this.currentIndex = previousIndex;
				return result;
			});
		});
	}

	equals(other) {
		return other instanceof SubNode
			&& this.roots === other.roots
			&& this.filter === other.filter;
	}

	toString() {
		return 'SubGraph[' + this.roots + ']';
	}
}

module.exports = SubNode;
