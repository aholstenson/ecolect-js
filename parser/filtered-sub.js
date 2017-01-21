'use strict';

const Node = require('./node');

class FilteredSubNode extends Node {
	constructor(roots, filter) {
		super();

		this.roots = roots;
		this.filteredRoots = null;
		this.filter = filter;
	}

	match(encounter) {
		if(! this.filteredRoots) {
			this.filteredRoots = this.roots.filter(n => ! (n instanceof FilteredSubNode));
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

		return encounter.branchWithOnMatch(onMatch, () => {
			return encounter.next(this.filteredRoots);
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
				console.log(result);
				return result;
			});
		})
	}


	toString() {
		return 'FilteredSubGraph[' + this.roots + ']';
	}
}

module.exports = FilteredSubNode;
