import { ValueMatcherFactory } from '../ValueMatcherFactory';
import { Language } from '../Language';
import { GraphBuilder } from '../../graph/GraphBuilder';

import { Weekday } from '../../time/Weekday';

export const dayOfWeekMatcher: ValueMatcherFactory<Weekday> = {
	id: 'day-of-week',

	create(language: Language) {
		return new GraphBuilder<number>(language)
			.name('day-of-week')

			// Day of week
			.map(
				{
					'mon': 1,
					'monday': 1,

					'tue': 2,
					'tuesday': 2,

					'wed': 3,
					'wednesday': 3,

					'thu': 4,
					'thurs': 4,
					'thursday': 4,

					'fri': 5,
					'friday': 5,

					'sat': 6,
					'saturday': 6,

					'sun': 0,
					'sunday': 0
				},
				l => l
			)

			.add([ 'on', GraphBuilder.result() ], v => v[0])

			.mapResults(m => m as Weekday)
			.onlyBest()
			.toMatcher();
	}
};
