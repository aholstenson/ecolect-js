import Node from '../graph/node';

/**
 * Custom node used by resolvers to match free-text expressions. This node
 * is greedy and matches as much as it can. This is done by checking if the
 * rest of the expression can match and then after that asking the value if
 * it matches.
 *
 * This type of node supports a few options:
 *
 * *
 * 	`greedy` - make the node try to match as much as possible and then work
 *   backward until it finds the smallest possible match.
 * *
 * 	`onlySingle` - make the value short circuit after it has first found a
 *   value. Useful when remotely validating values and using them in
 *   conjunction with repeating things such as options.
 */
export default class Value extends Node {
	constructor(id, options) {
		super();

		this.id = id;
		this.options = options;
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
			return encounter.isPartial ? encounter.next(0.0, 0) : Promise.resolve();
		}

		const onMatch = match => {
			return Promise.resolve(this.options.match(valueEncounter))
				.then(() => {
					if(valueEncounter._matches.length === 0) return;

					for(const v of valueEncounter._matches) {
						const matchCopy = match.copy();
						matchCopy.data.values[this.id] = v.value;
						matchCopy.scoreData.score += 0.9 * v.score;
						results.push(matchCopy);
					}
				});
		};

		const match = idx => {
			const len = idx - currentIndex;

			if((this.options.greedy && len === 0)
				|| (! this.options.greedy && idx > tokens.length)
			) return Promise.resolve();

			valueEncounter._adjust(currentIndex, idx);
			return encounter.branchWithOnMatch(onMatch, () => encounter.next(0, len))
				.then(() => {
					// If request to only match to keep
					if(this.options.onlySingle && results.length > 0) return;

					if(this.options.greedy) {
						if(len > 1) {
							return match(idx - 1);
						}
					} else {
						if(idx < tokens.length) {
							return match(idx + 1);
						}
					}
				});
		};

		return match(this.options.greedy ? stop : currentIndex + 1)
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
		this.partial = encounter.options.partial;
		this._matches = [];
	}

	_adjust(from, end) {
		this.tokens = this._encounter.tokens.slice(from, end);
		this._matches.length = 0;
	}

	text() {
		return this.tokens.raw();
	}

	match(value, score=1) {
		if(! this.partial && this._matches.length >= 1) {
			throw new Error('Multiple matches are only supported when in partial mode');
		}

		this._matches.push({ value, score });
	}
}
