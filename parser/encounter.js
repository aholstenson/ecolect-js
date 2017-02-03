'use strict';

const cloneDeep = require('lodash.clonedeep');

function scorePartial(tokens, depth, maxDepth, score) {
	return (1 / depth) * 0.8 + Math.min(1, score / depth) * 0.2;
}

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

		this.options = options;

		this._cache = new Map();
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

		let nextIndex = this.currentIndex + (consumedTokens || 0);
		const nextScore = this.currentScore + (score || 0);

		if(this.skipPunctuation) {
			/*
			 * Switch to the new index and read all of the punctuation tokens
			 * and then update index next matching starts at.
			 */
			this.currentIndex = nextIndex;
			this.readPunctuation();
			nextIndex = this.currentIndex;
		}

		let token = this.token(nextIndex);

		let pushedData = false;
		if(data !== null && typeof data !== 'undefined') {
			pushedData = true;
			this.data.push(data);
		}

		const branchInto = node => () => {
			let result = this.branch(node, () => {
				this.currentIndex = nextIndex;
				this.currentScore = nextScore;

				return node.match(this);
			});

			let push = item => {
				if(item instanceof Match) {
					results.push(item);
				} else {
					const score = this.partial
						? scorePartial(this.tokens.length, nextIndex, this.maxDepth, nextScore)
						: nextScore / this.tokens.length;
					results.push(new Match(nextIndex, score, item));
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
				return handleResult(result);
			}
		};

		let results = [];
		let promise = Promise.resolve();
		nodes.forEach(node => promise = promise.then(branchInto(node)));

		return promise.then(() => {
			if(pushedData) this.data.pop();

			if(results.length === 0 && this.fuzzy && token && token.punctuation) {
				/*
				 * The encounter is currently in fuzzy mode and we did not match,
				 * consume the next token if it's punctuation.
				 *
				 * The token will not count towards the score of any match later
				 * down the expression.
				 */
				return this.next(nodes, 0.0, (consumedTokens || 0) + 1, data);
			}

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
	 * Read any punctuation we can.
	 */
	readPunctuation() {
		let token = this.tokens[this.currentIndex];
		while(token && token.punctuation) {
			token = this.tokens[++this.currentIndex];
		}
	}

	/**
	 * Push the current match onto the result.
	 */
	match(data) {
		if(this.onMatch) {
			return this.onMatch(data);
		}
	}

	cache(index) {
		if(typeof index === 'undefined') {
			index = this.currentIndex;
		}

		let map = this._cache.get(index);
		if(map) return map;

		map = new Map();
		this._cache.set(index, map);
		return map;
	}
}

class Match {
	constructor(index, score, data) {
		this.index = index;
		this.score = score;
		this.data = data;
	}

	copy() {
		const r = new Match(this.index, this.score, cloneDeep(this.data));
		if(this.expression) {
			r.expression = cloneDeep(r.expression);
		}
		return r;
	}
}

module.exports = Encounter;
