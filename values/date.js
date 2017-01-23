'use strict';

const chrono = require('chrono-node');

const { LanguageSpecificValue } = require('./index');

/*
 * Date handling via Chrono.
 */
function createMatcher(options) {
	return {
		match(encounter) {
			const text = encounter.text();
			const results = chrono.parse(text, {
				forwardDate: options.onlyFuture || false
			});

			if(results.length !== 1) return null;

			const result = results[0];

			// Verify that the entire text has been consumed
			if(result.index !== 0 || result.text !== text) return null;

			// Date ranges do not match
			if(! options.range && result.end) return null;

			return result.start.date();
		}
	}
}

module.exports = function(options) {
	return new LanguageSpecificValue(function(language) {
		return createMatcher(options || {}, language);
	});
};
