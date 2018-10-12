'use strict';

const { isDeepEqual } = require('../utils/equality');
const ResolverParser = require('./parser');

const ResolvedIntent = require('./resolved-intent');

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
			let added;
			if(encounter.resultFilterCache) {
				added = encounter.resultFilterCache;
			} else {
				added = encounter.resultFilterCache = {};
			}

			if(! encounter.partial) {
				// Non-partial matching, don't create the result, just keep the highest scoring result
				if(! uniqueIntentFilter(added, this.data, encounter.currentScore)) {
					return null;
				}
			}

			const result = new ResolvedIntent(this.data);

			// Transfer any values that have been pushed by other parsers
			for(let i=0; i<encounter.data.length; i++) {
				const value = encounter.data[i];
				if(value.id && typeof value.value !== 'undefined') {
					result.values[value.id] = value.value;
				}
			}

			if(encounter.partial) {
				// Partial matching, keep same intents but with different values
				if(! partialIntentFilter(added, result)) {
					return null;
				}
			}

			// Build information about the matching expression
			result._updateExpression(encounter);

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

	build() {
		function makePrettyResult(result) {
			result.data.score = result.score;
			result.data._refreshExpression();
			return result.data;
		}

		this.parser.finalizer((results, encounter) => {
			// Sort the list by score
			results.sort((a, b) => b.score - a.score);

			// Filter results so only one result of each intent is available
			if(! encounter.partial) {
				const added = {};
				results = results.filter(m => uniqueIntentFilter(added, m.data.intent, m.score));
			}

			// Map so that only the data is made available
			results = results.map(makePrettyResult);

			return {
				best: results[0] || null,
				matches: results
			};
		});

		return this.parser;
	}
}

function uniqueIntentFilter(added, intent, score) {
	if(added[intent] && score <= added[intent]) {
		// This intent has already matched with a higher score
		return false;
	}

	added[intent] = score;
	return true;
}

function partialIntentFilter(added, match) {
	let matches = added[match.intent] || (added[match.intent] = []);
	for(let i=0; i<matches.length; i++) {
		if(isDeepEqual(matches[i], match.values)) {
			matches.push(match.values);
			return false;
		}
	}

	matches.push(match.values);
	return true;
}

module.exports = Builder;
