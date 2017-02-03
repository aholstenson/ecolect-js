'use strict';

const Node = require('../parser/node');

class Value extends Node {
	constructor(id, value) {
		super();

		this.id = id;
		this.value = value;
	}

	match(encounter) {
		const tokens = encounter.tokens;
		const idx = encounter.currentIndex;
		const stop = tokens.length;

		let promise = Promise.resolve(false);

		/**
		 * Values always try to match as much as they can so we loop backwards
		 * from the largest amount of tokens we could consume to only 1.
		 */
		let valueEncounter = new ValueEncounter(encounter);
		let results = [];
		for(let i=stop; i>idx; i--) {
			const currentStop = i;
			promise = promise.then(() => {
				const len = currentStop - idx;
				return encounter.next(len * 0.9, len)
					.then(nextMatched => {
						if(nextMatched && nextMatched.length > 0) {
							// The rest of the sequence will match

							valueEncounter._adjust(idx, currentStop);
							return Promise.resolve(
								this.value.match(valueEncounter)
							).then(value => {
								if(typeof value !== 'undefined' && value !== null) {
									nextMatched.forEach(match => {
										if(encounter.partial && Array.isArray(value)) {
											value.forEach(v => {
												match = match.copy();
												match.data.values[this.id] = v;
												results.push(match);
											});
										} else {
											match.data.values[this.id] = value;
											results.push(match);
										}
									});
									return nextMatched;
								}

								return null;
							});
						}

						return null;
					});
			});
		}

		if(encounter.partial) {
			if(idx >= stop) {
				// There are no tokens available for this value, assume it will match in the future
				return encounter.next(0.0, 0);
			}
		}

		return promise.then(() => {
			return results.length > 0 ? results : null;
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
	}

	_adjust(from, end) {
		this.tokens = this._encounter.tokens.slice(from, end);
	}

	text() {
		return this.tokens.raw();
	}
}
module.exports = Value;
