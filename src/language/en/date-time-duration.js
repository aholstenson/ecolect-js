import GraphBuilder from '../../graph/builder';

import { combine } from '../../time/matching';
import { map } from '../../time/durations';

export default function(language) {
	const timeDuration = language.timeDuration;
	const dateDuration = language.dateDuration;

	return new GraphBuilder(language)
		.name('date-time-duration')

		.skipPunctuation()

		.add(timeDuration, v => v[0])
		.add(dateDuration, v => v[0])

		.add([ GraphBuilder.result(), GraphBuilder.result() ], v => combine(v[0], v[1]))
		.add([ GraphBuilder.result(), 'and', GraphBuilder.result() ], v => combine(v[0], v[1]))

		.mapResults(map)
		.onlyBest()
		.toMatcher();
}
