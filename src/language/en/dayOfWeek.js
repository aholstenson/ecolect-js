import GraphBuilder from '../../graph/builder';

import { cloneObject } from '../../utils/cloning';

export default function(language) {
	return new GraphBuilder(language)
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
			l => ({ value: l })
		)

		.add([ 'on', GraphBuilder.result() ], v => v[0])

		.mapResults(cloneObject)
		.onlyBest()
		.toMatcher();
}
