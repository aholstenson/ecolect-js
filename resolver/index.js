'use strict';

function copy(values) {
	const result = {};
	Object.keys(values).forEach(key => {
		result[key] = values[key];
	});
	return result;
}

class Resolver {
	constructor(lang, roots) {
		this.lang = lang;
		this.roots = roots;
	}

	match(encounter) {
		if(typeof encounter === 'string') {
			encounter = new Encounter(this.lang, encounter);
		}

		encounter.outgoing = this.roots;
		return encounter.next(0, 0)
			.then(() => {
				encounter.results.sort((a, b) => b.score - a.score);

				return {
					best: encounter.results[0] || null,
					matches: encounter.results
				};
			});
	}
}

/**
 * Encounter used when trying to match an expression. Contains all the tokens
 * and functions for accessinng tokens, the current index and the current
 * score.
 */
class Encounter {
	constructor(lang, text, reject, resolve) {
		this.tokens = lang.tokenize(text);

		this.currentIndex = 0;
		this.currentScore = 0;

		this.results = [];
		this.data = {};

		this._reject = reject;
		this._resolve = resolve;
	}

	/**
	 * Get the token at the given index, or at the current index.
	 */
	token(index) {
		if(typeof index === 'undefined') index = this.currentIndex;

		return this.tokens[index];
	}

	/**
	 * Add an extracted value to this encounter.
	 */
	push(key, value) {
		this.data[key] = value;
		this.pushedValue = true;
	}

	/**
	 * Branch out this encounter and try to match all of the given nodes.
	 *
	 * For every outgoing node:
	 *   - Run the match method, checking if it matches
	 */
	next(score, consumedTokens) {
		const nextIndex = this.currentIndex + consumedTokens;
		const nextScore = this.currentScore + score;

		let matched = false;
		let promise = Promise.resolve();
		this.outgoing.forEach(node => promise = promise.then(() => {
			let result = this.branch(node, () => {
				this.currentIndex = nextIndex;
				this.currentScore = nextScore;

				return node.match(this);
			});

			let handleResult = nodeMatched => {
				if(nodeMatched) {
					matched = true;
				}
			};

			if(result && result.then) {
				return result.then(handleResult);
			} else {
				handleResult(result);
			}
		}));

		return promise.then(() => {
			return matched;
		});
	}

	branch(node, func) {
		const currentIndex = this.currentIndex;
		const currentScore = this.currentScore;
		const resultIndex = this.results.length;
		const outgoing = this.outgoing;

		const restore = (result) => {
			this.currentIndex = currentIndex;
			this.currentScore = currentScore;

			if(! result) {
				this.results.splice(resultIndex, this.results.length - resultIndex);
			} else if(this.pushedValue) {
				// Finalize the results by copying the appended results
				for(let i=resultIndex; i<this.results.length; i++) {
					this.results[i].values = copy(this.results[i].values);
				}

				this.pushedValue = false;
			}

			this.outgoing = outgoing;

			return result;
		};

		this.outgoing = node.outgoing;

		const result = func();

		if(result && result.then) {
			return result.then(restore);
		} else {
			restore(result);
			return result;
		}
	}

	/**
	 * Push the current match onto the result.
	 */
	match(data) {
		this.results.push({
			intent: data,
			values: this.data,
			score: this.currentScore / this.tokens.length
		});
	}
}


module.exports = Resolver;
