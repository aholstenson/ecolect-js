'use strict';

const Parser = require('../../parser');
const { combine } = require('../../time/matching');
const { map } = require('../../time/durations');

module.exports = function(language) {
	const timeDuration = language.timeDuration;
	const dateDuration = language.dateDuration;

	return new Parser(language)
		.name('date-time-duration')

		.skipPunctuation()

		.add(timeDuration, v => v[0])
		.add(dateDuration, v => v[0])

		.add([ Parser.result(), Parser.result() ], v => combine(v[0], v[1]))
		.add([ Parser.result(), 'and', Parser.result() ], v => combine(v[0], v[1]))

		.mapResults(map)
		.onlyBest();
};
