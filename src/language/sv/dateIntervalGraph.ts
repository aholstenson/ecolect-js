import { GraphBuilder } from '../../graph/index.js';
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
} from '../../type-datetime/index.js';
import { LanguageGraphFactory } from '../index.js';

import { dateGraph } from './dateGraph.js';
import { dateTimeDurationGraph } from './dateTimeDurationGraph.js';

export const dateIntervalGraph: LanguageGraphFactory<IntervalData> = {
	id: 'date-interval',

	create(language) {
		const date = language.graph(dateGraph);

		/*
		 * A length of time with an amount, such as `7 dagar`, `en vecka` or
		 * `24 timmar`.
		 */
		const countedDuration = language.graph(dateTimeDurationGraph);

		/*
		 * A length of time, either counted or a single period named on its
		 * own as in `den senaste veckan`.
		 */
		const duration = new GraphBuilder<DateTimeData>(language)
			.name('date-interval-duration')

			.skipPunctuation()

			.add(countedDuration, v => v[0])

			.add('dagen', () => ({ relativeDays: 1 }))
			.add('dygnet', () => ({ relativeDays: 1 }))
			.add('veckan', () => ({ relativeWeeks: 1 }))
			.add('månaden', () => ({ relativeMonths: 1 }))
			.add('kvartalet', () => ({ relativeQuarters: 1 }))
			.add('året', () => ({ relativeYears: 1 }))
			.add('timmen', () => ({ relativeHours: 1 }))
			.add('minuten', () => ({ relativeMinutes: 1 }))

			.build();

		return new GraphBuilder<IntervalData>(language)
			.name('date-interval')

			.add('när som helst', anyTime)
			.add('alltid', anyTime)

			.add('i det förflutna', inThePast)
			.add('tidigare', inThePast)

			.add('i framtiden', inTheFuture)
			.add('framöver', inTheFuture)

			.add(date, v => between(v[0]))

			// X till Y
			// januari till februari
			// januari 2010 till mars 2011
			// 2010-01-01 till 2010-02-05
			// februari till 2020
			.add([ GraphBuilder.result(hasSingle), 'till', GraphBuilder.result(hasSingle) ], v => between(v[0], v[1]))
			.add([ GraphBuilder.result(hasSingle), 'fram till', GraphBuilder.result(hasSingle) ], v => between(v[0], v[1]))
			.add([ GraphBuilder.result(hasSingle), '-', GraphBuilder.result(hasSingle) ], v => between(v[0], v[1]))
			.add([ GraphBuilder.result(hasSingle), 'och', GraphBuilder.result(hasSingle) ], v => between(v[0], v[1]))

			.add([ 'före', date ], v => before(v[0]))
			.add([ 'innan', date ], v => before(v[0]))
			.add([ 'efter', date ], v => after(v[0]))

			.add([ 'till', date ], v => until(v[0]))
			.add([ 'fram till', date ], v => until(v[0]))
			.add([ 'från', date ], v => from(v[0]))

			// From a date in the past up to today - sedan måndag, sedan 2020
			.add([ 'sedan', date ], (v, e) => since(v[0], e))

			/*
			 * Rolling ranges that end today, such as de senaste 7 dagarna or
			 * den senaste veckan. A single period is only named on its own
			 * after a longer prefix, so that `förra veckan` keeps meaning the
			 * previous calendar week.
			 */
			.add([ 'senaste', countedDuration ], (v, e) => lastDuration(v[0], e))
			.add([ 'förra', countedDuration ], (v, e) => lastDuration(v[0], e))
			.add([ 'föregående', countedDuration ], (v, e) => lastDuration(v[0], e))
			.add([ 'de senaste', duration ], (v, e) => lastDuration(v[0], e))
			.add([ 'den senaste', duration ], (v, e) => lastDuration(v[0], e))
			.add([ 'det senaste', duration ], (v, e) => lastDuration(v[0], e))
			.add([ 'gångna', duration ], (v, e) => lastDuration(v[0], e))

			// Rolling ranges that start today, such as de närmaste 7 dagarna
			.add([ 'nästa', countedDuration ], (v, e) => nextDuration(v[0], e))
			.add([ 'kommande', countedDuration ], (v, e) => nextDuration(v[0], e))
			.add([ 'de kommande', duration ], (v, e) => nextDuration(v[0], e))
			.add([ 'de närmaste', duration ], (v, e) => nextDuration(v[0], e))
			.add([ 'den närmaste', duration ], (v, e) => nextDuration(v[0], e))
			.add([ 'det närmaste', duration ], (v, e) => nextDuration(v[0], e))

			// From the start of the current period up to today
			.add('hittills i år', yearToDate)
			.add('hittills i kvartalet', quarterToDate)
			.add('hittills i månaden', monthToDate)
			.add('hittills i veckan', weekToDate)

			.add([ 'från', GraphBuilder.result() ], v => v[0])
			.add([ 'mellan', GraphBuilder.result() ], v => v[0])
			.add([ 'under', GraphBuilder.result() ], v => v[0])
			.add([ 'i', GraphBuilder.result() ], v => v[0])
			.add([ 'över', GraphBuilder.result() ], v => v[0])

			.build();
	}
};
