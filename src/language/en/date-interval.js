import GraphBuilder from '../../graph/builder';

import { between, until, before, from, after } from '../../time/matching';
import { hasSingle, map, inThePast, inTheFuture, anyTime } from '../../time/date-intervals';

export default function(language) {
	const date = language.date;

	return new GraphBuilder(language)
		.name('date-interval')

		.add('any time', anyTime)
		.add('at any time', anyTime)

		.add('in the past', inThePast)
		.add('past', inThePast)

		.add('in the future', inTheFuture)
		.add('future', inTheFuture)

		.add(date, between)

		// X to Y
		// January to February
		// January 2010 to March 2011
		// 2010-01-01 to 2010-02-05
		// February to 2020
		.add([ GraphBuilder.result(hasSingle), 'to', GraphBuilder.result(hasSingle) ], between)
		.add([ GraphBuilder.result(hasSingle), 'until', GraphBuilder.result(hasSingle) ], between)
		.add([ GraphBuilder.result(hasSingle), '-', GraphBuilder.result(hasSingle) ], between)
		.add([ GraphBuilder.result(hasSingle), 'and', GraphBuilder.result(hasSingle) ], between)

		.add([ 'before', date ], before)
		.add([ 'after', date ], after)

		.add([ 'until', date ], until)
		.add([ 'til', date ], until)
		.add([ 'from', date ], from)

		.add([ 'from', GraphBuilder.result() ], v => v[0])
		.add([ 'between', GraphBuilder.result() ], v => v[0])

		.mapResults(map)

		.onlyBest()
		.toMatcher();
}
