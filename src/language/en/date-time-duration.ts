import { GraphBuilder } from '../../graph/builder';
import { ValueMatcherFactory } from '../value-matcher-factory';

import { combine } from '../../time/matching';
import { map, Duration } from '../../time/durations';
import { timeDurationMatcher } from './time-duration';
import { dateDurationMatcher } from './date-duration';
import { DateTimeData } from '../../time/date-time-data';

export const dateTimeDurationMatcher: ValueMatcherFactory<Duration> = {
	id: 'date-time-duration',

	create(language) {
		const timeDuration = language.matcher(timeDurationMatcher);
		const dateDuration = language.matcher(dateDurationMatcher);

		return new GraphBuilder<DateTimeData>(language)
			.name('date-time-duration')

			.skipPunctuation()

			.add(timeDuration, v => v[0])
			.add(dateDuration, v => v[0])

			.add([ GraphBuilder.result(), GraphBuilder.result() ], v => combine(v[0], v[1]))
			.add([ GraphBuilder.result(), 'and', GraphBuilder.result() ], v => combine(v[0], v[1]))

			.mapResults(map)
			.onlyBest()
			.toMatcher();
	}
};
