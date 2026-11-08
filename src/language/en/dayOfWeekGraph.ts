import { DayOfWeek } from 'datetime-types';

import { GraphBuilder } from '../../graph/index.js';
import type { LanguageGraphFactory } from '../index.js';

/**
 * The words for the days of the week.
 */
const DAYS: Record<string, DayOfWeek> = {
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
};

export const dayOfWeekGraph: LanguageGraphFactory<DayOfWeek> = {
	id: 'day-of-week',

	create(language) {
		/*
		 * `on` is read before a day word and not before any result of this
		 * graph, so that it is read only once. A long run of `on` would
		 * otherwise be slow to read.
		 */
		const days = new GraphBuilder<DayOfWeek>(language)
			.name('day-of-week-word')
			.map(DAYS, l => l)
			.build();

		return new GraphBuilder<DayOfWeek>(language)
			.name('day-of-week')

			// Day of week
			.map(DAYS, l => l)

			.add([ 'on', days ], v => v[0])

			.build();
	}
};
