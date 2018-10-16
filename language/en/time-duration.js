'use strict';

const GraphBuilder = require('../../graph/builder');
const { combine } = require('../../time/matching');
const { map } = require('../../time/durations');

module.exports = function(language) {
	const integer = language.integer;

	return new GraphBuilder(language)
		.name('time-duration')

		.skipPunctuation()

		.add([ integer, 'hours' ], v => ({ relativeHours: v[0].value }))
		.add([ integer, 'hr' ], v => ({ relativeHours: v[0].value }))
		.add([ integer, 'h' ], v => ({ relativeHours: v[0].value }))
		.add([ integer, 'minutes' ], v => ({ relativeMinutes: v[0].value }))
		.add([ integer, 'm' ], v => ({ relativeMinutes: v[0].value }))
		.add([ integer, 'seconds' ], v => ({ relativeSeconds: v[0].value }))
		.add([ integer, 'sec' ], v => ({ relativeSeconds: v[0].value }))
		.add([ integer, 's' ], v => ({ relativeSeconds: v[0].value }))
		.add([ integer, 'milliseconds'], v => ({ relativeMilliseconds: v[0].value }))
		.add([ integer, 'millis'], v => ({ relativeMilliseconds: v[0].value }))
		.add([ integer, 'ms'], v => ({ relativeMilliseconds: v[0].value }))

		.add([ GraphBuilder.result(), GraphBuilder.result() ], v => combine(v[0], v[1]))
		.add([ GraphBuilder.result(), 'and', GraphBuilder.result() ], v => combine(v[0], v[1]))

		.mapResults(map)
		.onlyBest()
		.toMatcher();
};
