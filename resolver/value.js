'use strict';

const Node = require('./node');

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

		return promise.then(() => matched);
	}

	toString() {
		return 'Value[' + this.id + ']';
	}
}


class ValueEncounter {
	constructor(encounter) {
		this._encounter = encounter;
	}

	_adjust(from, end) {
		this.tokens = this._encounter.tokens.slice(from, end);
	}

	text() {
		return this.tokens.map(t => t.raw).join(' ');
	}
}
module.exports = Value;
