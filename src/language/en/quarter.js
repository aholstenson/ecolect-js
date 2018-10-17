import GraphBuilder from '../../graph/builder';

import { map, thisQuarter, nextQuarter, previousQuarter } from '../../time/quarters';

export default function(language) {
	const ordinal = language.ordinal;

	return new GraphBuilder(language)
		.name('quarters')

		.skipPunctuation()

		// Weeks relative to current time
		.add([ 'this quarter' ], thisQuarter)
		.add([ 'next quarter' ], nextQuarter)
		.add([ 'last quarter' ], previousQuarter)
		.add([ 'previous quarter' ], previousQuarter)

		.add([ 'quarter', ordinal ], v => ({ quarter: v[0].value }))
		.add([ 'q', ordinal ], v => ({ quarter: v[0].value }))
		.add([ ordinal, 'quarter' ], v => ({ quarter: v[0].value }))
		.add([ ordinal, 'q' ], v => ({ quarter: v[0].value }))

		.mapResults(map)
		.onlyBest()
		.toMatcher();
}
