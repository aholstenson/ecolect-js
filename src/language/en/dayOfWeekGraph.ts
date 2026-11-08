import { DayOfWeek } from 'datetime-types';

import { GraphBuilder } from '../../graph/index.js';
import { LanguageGraphFactory } from '../index.js';

export const dayOfWeekGraph: LanguageGraphFactory<DayOfWeek> = {
	id: 'day-of-week',

	create(language) {
		return new GraphBuilder<DayOfWeek>(language)
			.name('day-of-week')

			// Day of week
			.map(
				{
					'mon': DayOfWeek.MONDAY,
					'monday': DayOfWeek.MONDAY,

					'tue': DayOfWeek.TUESDAY,
					'tuesday': DayOfWeek.TUESDAY,

					'wed': DayOfWeek.WEDNESDAY,
					'wednesday': DayOfWeek.WEDNESDAY,

					'thu': DayOfWeek.THURSDAY,
					'thurs': DayOfWeek.THURSDAY,
					'thursday': DayOfWeek.THURSDAY,

					'fri': DayOfWeek.FRIDAY,
					'friday': DayOfWeek.FRIDAY,

					'sat': DayOfWeek.SATURDAY,
					'saturday': DayOfWeek.SATURDAY,

					'sun': DayOfWeek.SUNDAY,
					'sunday': DayOfWeek.SUNDAY
				},
				l => l
			)

			.add([ 'on', GraphBuilder.result() ], v => v[0])

			.build();
	}
};
