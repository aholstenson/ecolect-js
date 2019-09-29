import { LanguageGraphFactory } from '../LanguageGraphFactory';
import { GraphBuilder } from '../../graph/GraphBuilder';

import { DateTimeData } from '../../time/DateTimeData';

import { ordinalGraph } from './ordinalGraph';
import { thisWeek, nextWeek, previousWeek } from '../../time/weeks';
import { isSpecific } from '../../numbers/ordinals';

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
