import { GraphBuilder } from '@ecolect/graph';
import { LanguageGraphFactory } from '@ecolect/language';
import {
	DateTimeData,

	thisWeek,
	nextWeek,
	previousWeek
} from '@ecolect/type-datetime';
import { isSpecific } from '@ecolect/type-numbers';

import { ordinalGraph } from './ordinalGraph';

export const weekGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'week',

	create(language) {
		const ordinal = language.graph(ordinalGraph);

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

			.build();
	}
};
