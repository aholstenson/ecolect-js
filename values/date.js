'use strict';

const chrono = require('chrono-node');

module.exports = {
	match(encounter) {
		const text = encounter.text();
		const results = chrono.parse(text);

		if(results.length !== 1) return null;

		const result = results[0];

		// Verify that the entire text has been consumed
		if(result.index !== 0 || result.text !== text) return null;

		// Date ranges do not match
		if(result.end) return null;

		return result.start.date();
	}
};
