import { GraphBuilder } from '@ecolect/graph';
import { LanguageGraphFactory } from '@ecolect/language';
import {
	DateTimeData,
	IntervalData,

	between,
	until,
	before,
	from,
	after,
	since,

	lastDuration,
	nextDuration,

	yearToDate,
	quarterToDate,
	monthToDate,
	weekToDate,

	hasSingle,
	inThePast,
	inTheFuture,
	anyTime
} from '@ecolect/type-datetime';

import { dateGraph } from './dateGraph.js';
import { dateTimeDurationGraph } from './dateTimeDurationGraph.js';

export const dateIntervalGraph: LanguageGraphFactory<IntervalData> = {
	id: 'date-interval',

	create(language) {
		const date = language.graph(dateGraph);

		/*
		 * A length of time with an amount, such as `7 days`, `a week` or
		 * `24 hours`.
		 */
		const countedDuration = language.graph(dateTimeDurationGraph);

		/*
		 * A length of time, either counted or a single period named on its
		 * own as in `the past week`.
		 */
		const duration = new GraphBuilder<DateTimeData>(language)
			.name('date-interval-duration')

			.skipPunctuation()

			.add(countedDuration, v => v[0])

			.add('day', () => ({ relativeDays: 1 }))
			.add('week', () => ({ relativeWeeks: 1 }))
			.add('month', () => ({ relativeMonths: 1 }))
			.add('quarter', () => ({ relativeQuarters: 1 }))
			.add('year', () => ({ relativeYears: 1 }))
			.add('hour', () => ({ relativeHours: 1 }))
			.add('minute', () => ({ relativeMinutes: 1 }))

			.build();

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

			// From a date in the past up to today - since Monday, since 2020
			.add([ 'since', date ], (v, e) => since(v[0], e))

			/*
			 * Rolling ranges that end today, such as the last 7 days or the
			 * past week. A single period is only named on its own after a
			 * longer prefix, so that `last week` keeps meaning the previous
			 * calendar week.
			 */
			.add([ 'last', countedDuration ], (v, e) => lastDuration(v[0], e))
			.add([ 'previous', countedDuration ], (v, e) => lastDuration(v[0], e))
			.add([ 'the last', duration ], (v, e) => lastDuration(v[0], e))
			.add([ 'the previous', duration ], (v, e) => lastDuration(v[0], e))
			.add([ 'past', duration ], (v, e) => lastDuration(v[0], e))
			.add([ 'the past', duration ], (v, e) => lastDuration(v[0], e))

			// Rolling ranges that start today, such as the next 7 days
			.add([ 'next', countedDuration ], (v, e) => nextDuration(v[0], e))
			.add([ 'the next', duration ], (v, e) => nextDuration(v[0], e))
			.add([ 'coming', duration ], (v, e) => nextDuration(v[0], e))
			.add([ 'the coming', duration ], (v, e) => nextDuration(v[0], e))
			.add([ 'upcoming', duration ], (v, e) => nextDuration(v[0], e))

			// From the start of the current period up to today
			.add('year to date', yearToDate)
			.add('ytd', yearToDate)
			.add('quarter to date', quarterToDate)
			.add('qtd', quarterToDate)
			.add('month to date', monthToDate)
			.add('mtd', monthToDate)
			.add('week to date', weekToDate)
			.add('wtd', weekToDate)

			.add([ 'from', GraphBuilder.result() ], v => v[0])
			.add([ 'between', GraphBuilder.result() ], v => v[0])
			.add([ 'during', GraphBuilder.result() ], v => v[0])
			.add([ 'in', GraphBuilder.result() ], v => v[0])
			.add([ 'over', GraphBuilder.result() ], v => v[0])

			.build();
	}
};
