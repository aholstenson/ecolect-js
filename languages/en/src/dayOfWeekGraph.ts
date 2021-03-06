import { GraphBuilder } from '@ecolect/graph';
import { LanguageGraphFactory } from '@ecolect/language';

export const dayOfWeekGraph: LanguageGraphFactory<number> = {
	id: 'day-of-week',

	create(language) {
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

			.build();
	}
};
