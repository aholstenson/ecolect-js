import { GraphBuilder } from '../../graph/GraphBuilder';
import { ValueMatcherFactory } from '../ValueMatcherFactory';

import { between, until, before, from, after } from '../../time/matching';
import { hasSingle, map, inThePast, inTheFuture, anyTime } from '../../time/date-intervals';
import { IntervalValue } from '../../time/interval-value';
import { dateMatcher } from './date';
import { IntervalData } from '../../time/IntervalData';

export const dateIntervalMatcher: ValueMatcherFactory<IntervalValue> = {
	id: 'date-interval',

	create(language) {
		const date = language.matcher(dateMatcher);

		return new GraphBuilder<IntervalData>(language)
			.name('date-interval')

			.add('any time', anyTime)
			.add('at any time', anyTime)

			.add('in the past', inThePast)
			.add('past', inThePast)

			.add('in the future', inTheFuture)
			.add('future', inTheFuture)

			.add(date, v => between(v[0]))

			// X to Y
			// January to February
			// January 2010 to March 2011
			// 2010-01-01 to 2010-02-05
			// February to 2020
			.add([ GraphBuilder.result(hasSingle), 'to', GraphBuilder.result(hasSingle) ], v => between(v[0], v[1]))
			.add([ GraphBuilder.result(hasSingle), 'until', GraphBuilder.result(hasSingle) ], v => between(v[0], v[1]))
			.add([ GraphBuilder.result(hasSingle), '-', GraphBuilder.result(hasSingle) ], v => between(v[0], v[1]))
			.add([ GraphBuilder.result(hasSingle), 'and', GraphBuilder.result(hasSingle) ], v => between(v[0], v[1]))

			.add([ 'before', date ], v => before(v[0]))
			.add([ 'after', date ], v => after(v[0]))

			.add([ 'until', date ], v => until(v[0]))
			.add([ 'til', date ], v => until(v[0]))
			.add([ 'from', date ], v => from(v[0]))

			.add([ 'from', GraphBuilder.result() ], v => v[0])
			.add([ 'between', GraphBuilder.result() ], v => v[0])

			.mapResults(map)
			.onlyBest()
			.toMatcher();
	}
};
