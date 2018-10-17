import GraphBuilder from '../../graph/builder';

import { combine } from '../../time/matching';
import { map } from '../../time/durations';

export default function(language) {
	const integer = language.integer;

	return new GraphBuilder(language)
		.name('date-duration')

		.skipPunctuation()

		.add([ integer, 'years' ], v => ({ relativeYears: v[0].value }))
		.add([ integer, 'yrs' ], v => ({ relativeYears: v[0].value }))
		.add([ integer, 'y' ], v => ({ relativeYears: v[0].value }))
		.add([ integer, 'quarters' ], v => ({ relativeQuarters: v[0].value }))
		.add([ integer, 'q' ], v => ({ relativeQuarters: v[0].value }))
		.add([ integer, 'weeks' ], v => ({ relativeWeeks: v[0].value }))
		.add([ integer, 'wks' ], v => ({ relativeWeeks: v[0].value }))
		.add([ integer, 'w' ], v => ({ relativeWeeks: v[0].value }))
		.add([ integer, 'months' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'mths' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'mon' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'm' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'days' ], v => ({ relativeDays: v[0].value }))
		.add([ integer, 'd' ], v => ({ relativeDays: v[0].value }))

		.add([ GraphBuilder.result(), GraphBuilder.result() ], v => combine(v[0], v[1]))
		.add([ GraphBuilder.result(), 'and', GraphBuilder.result() ], v => combine(v[0], v[1]))

		.mapResults(map)
		.onlyBest()
		.toMatcher();
}
