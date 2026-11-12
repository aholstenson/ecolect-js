import { GraphBuilder } from '../../graph/index.js';
import type {
	DateTimeData} from '../../type-datetime/index.js';
import {

	thisWeek,
	nextWeek,
	weekAfterNext,
	previousWeek
} from '../../type-datetime/index.js';
import type { OrdinalData } from '../../type-numbers/index.js';
import { isSpecific } from '../../type-numbers/index.js';
import type { LanguageGraphFactory } from '../index.js';

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
			.add([ 'week after next' ], weekAfterNext)
			.add([ 'the week after next' ], weekAfterNext)
			.add([ 'last week' ], previousWeek)
			.add([ 'previous week' ], previousWeek)

			.add([ 'week', weekNumber ], v => ({ week: v[0].value }))
			.add([ specificWeekNumber, 'week' ], v => ({ week: v[0].value }))

			.build();
	}
};
