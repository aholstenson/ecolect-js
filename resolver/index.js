'use strict';

const Token = require('./token');
const Value = require('./value');

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

	match(encounter, options) {
		if(typeof encounter === 'string') {
			encounter = new Encounter(this.lang, encounter, options || {});
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
	constructor(lang, text, options) {
		this.tokens = lang.tokenize(text);

		this.currentIndex = 0;
		this.currentScore = 0;
		this.currentNodes = [];
		this.maxDepth = 0;

		this.results = [];
		this.data = {};

		this.partial = options.partial || false;
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

		this.currentNodes.push(node);
		this.maxDepth = Math.max(this.maxDepth, this.currentNodes.length);

		const restore = (result) => {
			this.currentIndex = currentIndex;
			this.currentScore = currentScore;

			if(! result) {
				this.results.splice(resultIndex, this.results.length - resultIndex);
			} else if(this.pushedValue) {
				// Finalize the results by copying the appended results
				for(let i=resultIndex; i<this.results.length; i++) {
					const r = this.results[i];
					r.values = copy(r.values);
					r.expression = this.enhanceExpression(r.expression, r.values);
				}

				this.pushedValue = false;
			}

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

	/**
	 * Push the current match onto the result.
	 */
	match(data) {
		const score = this.partial
			? this.currentScore
			: this.currentScore / this.tokens.length;

		// Check if we already have a result for this intent
		let idx;
		for(let i=0; i<this.results.length; i++) {
			const r = this.results[i];
			if(r.intent === data) {
				if(r.score >= score) {
					// We have a matching result with better score, skip this match
					return;
				} else {
					idx = i;
					break;
				}
			}
		}

		const result = {
			intent: data,
			values: this.data,
			score: score,
		};

		if(this.partial) {
			result.expression = this.describeExpression();
		}

		if(idx >= 0) {
			this.results[idx] = result;
		} else {
			this.results.push(result);
		}
	}

	describeExpression() {
		// Partial matching so expose the full expression that would match
		let path = [];
		let text = [];
		this.currentNodes.forEach(node => {
			if(node instanceof Token) {
				text.push(node.token.raw);
			} else if(node instanceof Value) {
				if(text.length > 0) {
					path.push({
						type: 'text',
						value: text.join(' ')
					});
					text.length = 0;
				}

				path.push({
					type: 'value',
					id: node.id
				});
			}
		});

		if(text.length > 0) {
			path.push({
				type: 'text',
				value: text.join(' ')
			});
		}

		return path;
	}

	enhanceExpression(expression, values) {
		if(! expression) return;

		expression.forEach(p => {
			if(p.type === 'value') {
				p.value = values[p.id];
			}
		});

		return expression;
	}
}


module.exports = Resolver;
