'use strict';

const Parser = require('../../parser');

const cloneDeep = require('lodash.clonedeep');

module.exports = function(language) {
	return new Parser(language)
		.name('dayOfWeek')

		// Day of week
		.map(
			{
				'mon': 1,
				'monday': 1,

				'tue': 2,
				'tuesday': 2,

				'wed': 3,
				'wednesday': 3,

				'thu': 4,
				'thurs': 4,
				'thursday': 4,

				'fri': 5,
				'friday': 5,

				'sat': 6,
				'saturday': 6,

				'sun': 7,
				'sunday': 7
			},
			l => { return { value: l } }
		)

		.add([ 'on', Parser.result() ], v => v[0])

		.mapResults(cloneDeep)
		.onlyBest();
}
