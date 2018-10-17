import Match from './match';
import MatchSet from './match-set';

function scorePartial(tokens, depth, maxDepth, score) {
	return (1 / depth) * 0.8 + Math.min(1, score / depth) * 0.2;
}

/**
 * Encounter used when trying to match an expression. Contains all the tokens
 * and functions for accessinng tokens, the current index and the current
 * score.
 */
export default class Encounter {
	constructor(lang, text, options) {
		this.tokens = lang.tokenize(text);

		this.currentIndex = 0;
		this.currentScore = 0;
		this.currentNodes = [];
		this.currentTokens = [];
		this.data = [];
		this.matches = new MatchSet({
			isEqual: options.matchIsEqual
		});
		this.maxDepth = 0;

		this.partial = options.partial || false;
		this.onMatch = options.onMatch;
		this.verbose = options.verbose;
		this.onlyComplete = options.onlyComplete || false;

		this.options = options;

		this._cache = [];
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

		let nextIndexAfterPunctuation = nextIndex;
		if(this.skipPunctuation) {
			/*
			 * Switch to the new index and read all of the punctuation tokens
			 * and then update index next matching starts at.
			 */
			this.currentIndex = nextIndex;
			this.readPunctuation();
			nextIndexAfterPunctuation = this.currentIndex;
		}

		let pushedData = false;
		if(data !== null && typeof data !== 'undefined') {
			pushedData = true;
			this.data.push(data);
		}

		const currentIndex = this.currentIndex;
		const currentScore = this.currentScore;
		const outgoing = this.outgoing;

		/**
		 * Create a function that evaluates the given node.
		 *
		 * @param {Node} node
		 */
		const branchInto = node => () => {
			this.maxDepth = Math.max(this.maxDepth, this.currentNodes.length);

			// Switch to the next index and score
			this.currentIndex = node.supportsPunctuation ? nextIndex : nextIndexAfterPunctuation;
			this.currentScore = nextScore;

			this.currentNodes.push(node);
			this.currentTokens.push(this.currentIndex);

			// Swap the nodes being used
			this.outgoing = node.outgoing;

			// Match the result
			const result = node.match(this);

			if(result && result.then) {
				// If the match returned a promise chain the reset
				return result.then(() => {
					// Restore the indexes
					this.currentIndex = currentIndex;
					this.currentScore = currentScore;

					this.outgoing = outgoing;
					this.currentNodes.pop();
					this.currentTokens.pop();
				});
			} else {
				// If the result was not a promise reset directly
				this.currentIndex = currentIndex;
				this.currentScore = currentScore;

				this.outgoing = outgoing;
				this.currentNodes.pop();
				this.currentTokens.pop();
				return result;
			}
		};

		let promise = Promise.resolve();
		for(let i=0; i<nodes.length; i++) {
			promise = promise.then(branchInto(nodes[i]));
		}

		return promise.then(() => {
			if(pushedData) this.data.pop();

			let token = this.tokens[nextIndexAfterPunctuation];
			if(this.fuzzy && token && token.punctuation) {
				/*
				 * The encounter is currently in fuzzy mode and we did not match,
				 * consume the next token if it's punctuation.
				 *
				 * The token will not count towards the score of any match later
				 * down the expression.
				 */
				return this.next(nodes, 0.0, (consumedTokens || 0) + 1, data);
			}
		});
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
	 * Get the index of the first non-skipped token.
	 *
	 * This looks backwards in the tokens to try to find the first
	 * non-punctuation token. Used by SubNodes to allow puncutation to be
	 * used both the parent parser and the sub-parser.
	 */
	previousNonSkipped() {
		if(! this.skipPunctuation) return this.currentIndex;

		let idx = this.currentIndex - 1;
		let token = this.tokens[idx];
		while(token && token.punctuation) {
			token = this.tokens[--idx];
		}
		return idx + 1;
	}

	remainingTokens() {
		return this.tokens.slice(this.currentIndex);
	}

	/**
	 * Push the current match onto the result.
	 */
	match(data) {
		let match;
		if(data instanceof Match) {
			match = data;
		} else {
			let score;
			if(this.partial) {
				score = scorePartial(this.tokens.length, this.currentIndex, this.maxDepth, this.currentScore);
			} else {
				score = this.currentScore / this.tokens.length;
			}

			match = new Match(this.currentIndex, score, data);
		}

		if(this.onMatch) {
			return this.onMatch(match);
		} else {
			if(this.onlyComplete && match.index < this.tokens.length) {
				// Skip this match unless it has consumed all tokens
				return;
			}

			this.matches.add(match);
		}
	}

	/**
	 * Get a map that can be used to cache things during the evaluation of
	 * a graph. This is used by sub-nodes to cache their results based on the
	 * start index.
	 *
	 * @param {number} index
	 */
	cache(index=this.currentIndex) {
		let map = this._cache[index];
		if(map) return map;

		map = new Map();
		this._cache[index] = map;
		return map;
	}
}
