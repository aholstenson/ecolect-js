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
					'mån': DayOfWeek.MONDAY,
					'måndag': DayOfWeek.MONDAY,

					'tis': DayOfWeek.TUESDAY,
					'tisdag': DayOfWeek.TUESDAY,

					'ons': DayOfWeek.WEDNESDAY,
					'onsdag': DayOfWeek.WEDNESDAY,

					'tor': DayOfWeek.THURSDAY,
					'tors': DayOfWeek.THURSDAY,
					'torsdag': DayOfWeek.THURSDAY,

					'fre': DayOfWeek.FRIDAY,
					'fredag': DayOfWeek.FRIDAY,

					'lör': DayOfWeek.SATURDAY,
					'lördag': DayOfWeek.SATURDAY,

					'sön': DayOfWeek.SUNDAY,
					'söndag': DayOfWeek.SUNDAY
				},
				l => l
			)

			.add([ 'på', GraphBuilder.result() ], v => v[0])

			.build();
	}
};
