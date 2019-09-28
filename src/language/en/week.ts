import { ValueMatcherFactory } from '../value-matcher-factory';
import { IntervalValue } from '../../time/interval-value';
import { GraphBuilder } from '../../graph/builder';
import { DateTimeData } from '../../time/date-time-data';

import { ordinalMatcher } from './ordinal';
import { map, thisWeek, nextWeek, previousWeek } from '../../time/weeks';
import { isSpecific } from '../../numbers/ordinals';

export const weekMatcher: ValueMatcherFactory<IntervalValue> = {
	id: 'week',

	create(language) {
		const ordinal = language.matcher(ordinalMatcher);

		return new GraphBuilder<DateTimeData>(language)
			.name('week')

			.skipPunctuation()

			// Weeks relative to current time
			.add([ 'this week' ], thisWeek)
			.add([ 'next week' ], nextWeek)
			.add([ 'last week' ], previousWeek)
			.add([ 'previous week' ], previousWeek)

			.add([ 'week', ordinal ], v => ({ week: v[0].value }))
			.add([ GraphBuilder.result(ordinal, isSpecific), 'week' ], v => ({ week: v[0].value }))

			.mapResults(map)
			.onlyBest()
			.toMatcher();
	}
};
