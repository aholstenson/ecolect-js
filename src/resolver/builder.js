import Matcher from '../graph/matching/matcher';
import ResolverParser from './parser';
import ResolvedIntent from './resolved-intent';

/**
 * This is a basic naive builder for instances of Resolver on top of the
 * parser.
 */
export default class Builder {
	constructor(language, data) {
		this.language = language;

		this.values = {};

		this.parser = new ResolverParser(language);
		this.data = data || 'unknown';

		this.resultHandler = (values, encounter) => {
			const result = new ResolvedIntent(this.data);

			// Transfer any values that have been pushed by other parsers
			for(let i=0; i<encounter.data.length; i++) {
				const value = encounter.data[i];
				if(value.id && typeof value.value !== 'undefined') {
					result.values[value.id] = value.value;
				}
			}

			// TODO: Only build expression if match is accepted

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
		if(firstArg instanceof Matcher) {
			/**
			 * If adding another parser for resolving intent just copy all
			 * of its nodes as they should work just fine with our own parser.
			 *
			 * TODO: Maybe use add instead to use optimization?
			 */
			firstArg.nodes.forEach(r => this.parser.outgoing.push(r));
			return this;
		}

		this.parser.add(Array.prototype.slice.call(arguments), this.resultHandler);

		return this;
	}

	build() {
		this.parser.finalizer((results, encounter) => {
			// Map so that only the data is made available
			results = results.map(finalizeIntent);

			return {
				best: results[0] || null,
				matches: results
			};
		});

		return this.parser.toMatcher();
	}
}

function finalizeIntent(result) {
	result.data.score = result.score;
	result.data._refreshExpression();
	return result.data;
}
