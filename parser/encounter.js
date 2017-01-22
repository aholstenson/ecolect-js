'use strict';

/**
 * Encounter used when trying to match an expression. Contains all the tokens
 * and functions for accessinng tokens, the current index and the current
 * score.
 */
class Encounter {
	constructor(lang, text, options) {
		this.tokens = lang.tokenize(text);

		this.currentIndex = 0;
		this.currentScore = 0;
		this.currentNodes = [];
		this.data = [];
		this.maxDepth = 0;

		this.partial = options.partial || false;
		this.onMatch = options.onMatch;
		this.verbose = options.verbose;
	}

	/**
	 * Get the token at the given index, or at the current index.
	 */
	token(index) {
		if(typeof index === 'undefined') index = this.currentIndex;

		return this.tokens[index];
	}

	get hasMoreTokens() {
		return this.currentIndex < this.tokens.length - 1;
	}

	get isLastToken() {
		return this.currentIndex === this.tokens.length - 1;
	}

	/**
	 * Branch out this encounter and try to match all of the given nodes.
	 *
	 * For every outgoing node:
	 *   - Run the match method, checking if it matches
	 */
	next(nodes, score, consumedTokens, data) {
		if(! Array.isArray(nodes)) {
			// If the first argument is not a list of nodes assume outgoing
			return this.next(this.outgoing, nodes, score, consumedTokens);
		}

		const nextIndex = this.currentIndex + (consumedTokens || 0);
		const nextScore = this.currentScore + (score || 0);

		let pushedData = false;
		if(data) {
			pushedData = true;
			this.data.push(data);
		}

		let results = [];
		let promise = Promise.resolve();
		nodes.forEach(node => promise = promise.then(() => {
			let result = this.branch(node, () => {
				this.currentIndex = nextIndex;
				this.currentScore = nextScore;

				return node.match(this);
			}, data);

			let push = item => {
				if(item instanceof Match) {
					results.push(item);
				} else {
					results.push(new Match(nextIndex, nextScore, item));
				}
			};

			let handleResult = r => {
				if(Array.isArray(r)) {
					r.forEach(push);
				} else if(r != null && typeof r !== 'undefined') {
					push(r);
				}
			};

			if(result && result.then) {
				return result.then(handleResult);
			} else {
				handleResult(result);
			}
		}));

		return promise.then(() => {
			if(pushedData) this.data.pop();

			return results;
		});
	}

	branch(node, func) {
		const currentIndex = this.currentIndex;
		const currentScore = this.currentScore;
		const outgoing = this.outgoing;

		this.currentNodes.push(node);

		this.maxDepth = Math.max(this.maxDepth, this.currentNodes.length);

		const restore = (result) => {
			this.currentIndex = currentIndex;
			this.currentScore = currentScore;

			this.outgoing = outgoing;
			this.currentNodes.pop();

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

	branchWithOnMatch(newOnMatch, func) {
		const onMatch = this.onMatch;
		this.onMatch = newOnMatch;

		let r = func();
		if(r && r.then) {
			r = r.then(() => this.onMatch = onMatch);
		} else {
			this.onMatch = onMatch;
		}

		return r;
	}

	/**
	 * Push the current match onto the result.
	 */
	match(data) {
		if(this.onMatch) {
			return this.onMatch(data);
		}
	}
}

class Match {
	constructor(index, score, data) {
		this.index = index;
		this.score = score;
		this.data = data;
	}
}

module.exports = Encounter;
