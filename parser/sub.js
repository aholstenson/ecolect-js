'use strict';

const Node = require('./node');

class SubNode extends Node {
	constructor(roots, filter) {
		super();

		this.roots = Array.isArray(roots) ? roots : [ roots ];
		this.filter = filter;
	}

	match(encounter) {
		const variants = [];
		const onMatch = result => {
			variants.push({
				index: encounter.currentIndex,
				score: encounter.currentScore,
				data: result
			});
		};

		return encounter.branchWithOnMatch(onMatch, () => {
			return encounter.next(this.roots);
		}).then(() => {
			let promise = Promise.resolve();
			variants.forEach(v => promise = promise.then(() => {
				return encounter.next(
					v.score - encounter.currentScore,
					v.index - encounter.currentIndex
				);
			}));

			return promise;
		})
	}

	toString() {
		return 'SubGraph[' + this.roots + ']';
	}
}

module.exports = SubNode;
