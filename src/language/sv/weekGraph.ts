import { GraphBuilder } from '../../graph/index.js';
import {
	DateTimeData,

	thisWeek,
	nextWeek,
	previousWeek
} from '../../type-datetime/index.js';
import { isSpecific, OrdinalData } from '../../type-numbers/index.js';
import { LanguageGraphFactory } from '../index.js';

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
			.add([ 'denna vecka' ], thisWeek)
			.add([ 'denna veckan' ], thisWeek)
			.add([ 'den här veckan' ], thisWeek)
			.add([ 'innevarande vecka' ], thisWeek)
			.add([ 'nästa vecka' ], nextWeek)
			.add([ 'kommande vecka' ], nextWeek)
			.add([ 'förra veckan' ], previousWeek)
			.add([ 'föregående vecka' ], previousWeek)

			.add([ 'vecka', weekNumber ], v => ({ week: v[0].value }))
			.add([ 'v', weekNumber ], v => ({ week: v[0].value }))
			.add([ specificWeekNumber, 'veckan' ], v => ({ week: v[0].value }))

			.build();
	}
};
