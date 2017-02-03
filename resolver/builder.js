'use strict';

const isEqual = require('lodash.isequal');
const ResolverParser = require('./parser');

const TokenNode = require('../parser/token');
const ValueNode = require('./value');
const ValueParserNode = require('./value-parser');

/**
 * This is a basic naive builder for instances of Resolver on top of the
 * parser.
 */
class Builder {
	constructor(language, data) {
		this.language = language;

		this.values = {};

		this.parser = new ResolverParser(language);
		this.data = data || 'unknown';

		this.resultHandler = (values, encounter) => {
			const result = {
				intent: this.data,
				values: {}
			};

			// Transfer any values that have been pushed by other parsers
			encounter.data.forEach(value => {
				if(value.id && typeof value.value !== 'undefined') {
					result.values[value.id] = value.value;
				}
			});

			if(encounter.partial) {
				result.expression = this.describeExpression(encounter);
			}

			return result;
		};
	}

	value(id, type) {
		this.parser.value(id, type);
		return this;
	}

	add(firstArg) {
		if(firstArg instanceof ResolverParser) {
			/**
			 * If adding another parser for resolving intent just copy all
			 * of its nodes as they should work just fine with our own parser.
			 *
			 * TODO: Maybe use add instead to use optimization?
			 */
			firstArg.outgoing.forEach(r => this.parser.outgoing.push(r));
			return this;
		}

		this.parser.add(Array.prototype.slice.call(arguments), this.resultHandler);

		return this;
	}

	describeExpression(encounter) {
		// Partial matching so expose the full expression that would match
		let path = [];
		let text = [];
		encounter.currentNodes.forEach(node => {
			if(node instanceof TokenNode) {
				text.push(node.token.raw);
			} else if(node instanceof ValueNode || node instanceof ValueParserNode) {
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

	build() {
		function makePrettyResult(result) {
			result.data.score = result.score;
			return result.data;
		}

		this.parser.finalizer((results, encounter) => {
			results = results.map(makePrettyResult);
			results.sort((a, b) => b.score - a.score);

			// Filter results so only one result of each intent is available
			const filter = encounter.partial
				? partialIntentFilter()
				: uniqueIntentFilter();
			results = results.filter(filter)
				.map(r => {
					// Ensure that partial matching exposes the values in the expression
					if(r.expression) {
						r.pending = false;
						r.expression.forEach(part => {
							if(part.type === 'value') {
								part.value = r.values[part.id] || null;
								if(part.value === null) {
									r.pending = true;
								}
							}
						});
					}

					return r;
				})

			return {
				best: results[0] || null,
				matches: results
			};
		});

		return this.parser;
	}
}

function uniqueIntentFilter() {
	const added = {};
	return function(match) {
		if(added[match.intent]) return false;
		return added[match.intent] = true;
	};
}

function partialIntentFilter() {
	const added = {};
	return function(match) {
		let matches = added[match.intent] || (added[match.intent] = []);
		for(let i=0; i<matches.length; i++) {
			if(isEqual(matches[i], match.values)) {
				matches.push(match.values);
				return false;
			}
		}

		matches.push(match.values);
		return true;
	};
}

module.exports = Builder;
