'use strict';

const Node = require('./node');

class FilteredSubNode extends Node {
	constructor(roots, filter) {
		super();

		this.roots = roots;
		this.filter = filter;
	}

	match(encounter) {
		if(this.currentIndex === encounter.currentIndex) {
			/*
			 * If this node is called with the same index again we skip
			 * evaulating.
			 */
			return null;
		}

		const variants = [];
		const onMatch = result => {
			if(! this.filter(result)) return;

			variants.push({
				index: encounter.currentIndex,
				score: encounter.currentScore,
				data: result
			});
		};

		// Set the index we were called at
		let previousIndex = this.currentIndex;
		this.currentIndex = encounter.currentIndex;

		return encounter.branchWithOnMatch(onMatch, () => {
			return encounter.next(this.roots);
		}).then(() => {
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
		})
	}


	toString() {
		return 'FilteredSubGraph[' + this.roots + ']';
	}
}

module.exports = FilteredSubNode;
