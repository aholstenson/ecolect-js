import { GraphBuilder } from '@ecolect/graph';
import { LanguageGraphFactory } from '@ecolect/language';
import {
	DateTimeData,

	thisWeek,
	nextWeek,
	previousWeek
} from '@ecolect/type-datetime';
import { isSpecific, OrdinalData } from '@ecolect/type-numbers';

import { ordinalGraph } from './ordinalGraph.js';

export const weekGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'week',

	create(language) {
		const ordinal = language.graph(ordinalGraph);

		// A year has at most 53 weeks
		const inRange = (v: OrdinalData) => v.value >= 1 && v.value <= 53;
		const weekNumber = GraphBuilder.result<OrdinalData>(ordinal, inRange);
		const specificWeekNumber = GraphBuilder.result<OrdinalData>(ordinal, v => isSpecific(v) && inRange(v));

		return new GraphBuilder<DateTimeData>(language)
			.name('week')

			.skipPunctuation()

			// Weeks relative to current time
			.add([ 'this week' ], thisWeek)
			.add([ 'next week' ], nextWeek)
			.add([ 'last week' ], previousWeek)
			.add([ 'previous week' ], previousWeek)

			.add([ 'week', weekNumber ], v => ({ week: v[0].value }))
			.add([ specificWeekNumber, 'week' ], v => ({ week: v[0].value }))

			.build();
	}
};
