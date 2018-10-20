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
		function makePrettyResult(result, data) {
			if(result.isPartialData()) {
				result.data = new ResolvedIntent(data);

			} else {
				result.data._refreshExpression();
			}

			result.data.score = result.score;
			return result.data;
		}

		this.parser.finalizer((results, encounter) => {
			// Map so that only the data is made available
			results = results
				.map(match => makePrettyResult(match, this.data));

			return {
				best: results[0] || null,
				matches: results
			};
		});

		return this.parser.toMatcher();
	}
}
