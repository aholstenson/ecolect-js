'use strict';

const Node = require('../graph/node');

/**
 * Custom node used by resolvers to match free-text expressions. This node
 * is greedy and matches as much as it can. This is done by checking if the
 * rest of the expression can match and then after that asking the value if
 * it matches.
 */
class Value extends Node {
	constructor(id, value) {
		super();

		this.id = id;
		this.value = value;
	}

	match(encounter) {
		const tokens = encounter.tokens;
		const currentIndex = encounter.currentIndex;
		const stop = tokens.length;

		/**
		 * Values always try to match as much as they can so we loop backwards
		 * from the largest amount of tokens we could consume to only 1.
		 */
		let valueEncounter = new ValueEncounter(encounter);
		let results = [];

		if(currentIndex >= stop) {
			/*
			 * If the current index has passed the end of the tokens either
			 * assume this will match in the future if this is partial or
			 * short circuit without looking ahead in the graph.
			 */
			return encounter.partial ? encounter.next(0.0, 0) : Promise.resolve();
		}

		const onMatch = match => {
			return Promise.resolve(this.value.match(valueEncounter))
				.then(() => {
					if(valueEncounter._matches.length === 0) return;

					for(const v of valueEncounter._matches) {
						const matchCopy = match.copy();
						matchCopy.data.values[this.id] = v.value;
						results.push(matchCopy);
					}
				});
		};

		const match = idx => {
			const len = idx - currentIndex;

			if(len === 0) return Promise.resolve();

			valueEncounter._adjust(currentIndex, idx);
			return encounter.branchWithOnMatch(onMatch, () => encounter.next(len * 0.9, len))
				.then(() => {
					if(len > 1) {
						return match(idx - 1);
					}
				});
		};

		return match(stop)
			.then(() => {
				for(const result of results) {
					encounter.match(result);
				}
			});
	}

	toString() {
		return 'Value[' + this.id + ']';
	}
}


class ValueEncounter {
	constructor(encounter) {
		this._encounter = encounter;
		this.partial = encounter.partial;
		this._matches = [];
	}

	_adjust(from, end) {
		this.tokens = this._encounter.tokens.slice(from, end);
		this._matches.length = 0;
	}

	text() {
		return this.tokens.raw();
	}

	match(value, score=undefined) {
		if(! this._encounter.partial && this._matches.length >= 1) {
			throw new Error('Multiple matches are only supported when in partial mode');
		}

		this._matches.push({ value, score });
	}
}
module.exports = Value;
