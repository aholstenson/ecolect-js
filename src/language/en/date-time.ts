import { GraphBuilder } from '../../graph/GraphBuilder';
import { ValueMatcherFactory } from '../ValueMatcherFactory';
import { DateValue } from '../../time/date-value';
import { DateTimeData } from '../../time/DateTimeData';

import { combine, isRelative } from '../../time/matching';
import { map } from '../../time/date-times';
import { dateMatcher } from './date';
import { timeMatcher } from './time';

export const dateTimeMatcher: ValueMatcherFactory<DateValue> = {
	id: 'date-time',

	create(language) {
		const time = language.matcher(timeMatcher);
		const date = language.matcher(dateMatcher);

		return new GraphBuilder<DateTimeData>(language)
			.name('date-time')

			.skipPunctuation()

			.add(time, v => v[0])
			.add(date, v => v[0])

			.add([ time, date ], v => combine(v[0], v[1]))
			.add([ time, 'and', date ], v => combine(v[0], v[1]))

			.add([ date, time ], v => combine(v[0], v[1]))
			.add([ date, 'and', time ], v => combine(v[0], v[1]))

			.add(GraphBuilder.result(date, isRelative), (v, e) => v[0])

			.mapResults(map)
			.onlyBest()
			.toMatcher();
	}
};
