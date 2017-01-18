'use strict';

const Node = require('./node');
const utils = require('../language/utils');

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
		let matched = false;
		for(let i=stop; i>idx; i--) {
			const currentStop = i;
			promise = promise.then(() => {
				const len = currentStop - idx;
				return encounter.next(len * 0.9, len)
					.then(nextMatched => {
						if(nextMatched) {
							// The rest of the sequence will match

							valueEncounter._adjust(idx, currentStop);
							return Promise.resolve(
								this.value.match(valueEncounter)
							).then(value => {
								if(typeof value !== 'undefined' && value !== null) {
									encounter.push(this.id, value);
									matched = true;
									return true;
								}

								return false;
							});
						}

						return false;
					});
			});
		}

		if(encounter.partial && idx >= stop) {
			// There are no tokens available for this value, assume it will match in the future
			return encounter.next(0.0, 0);
		}

		return promise.then(() => matched);
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
		return utils.raw(this.tokens);
	}
}
module.exports = Value;
