'use strict';

const any = require('../values/any');
const date = require('../values/date');


module.exports = {
	tokenize(string) {
		return string.split(/\s+/)
			.filter(t => t.length > 0)
			.map(t => {
				return {
					raw: t,
					normalized: t.toLowerCase(),
				}
			});
	},

	compareTokens(a, b) {
		if(a.normalized === b.normalized) return 1.0;

		return 0;
	},

	comparePartialTokens(a, b) {
		return a.normalized.indexOf(b.normalized) === 0;
	},

	any: any,

	date: date
};
