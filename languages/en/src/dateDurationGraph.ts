import { GraphBuilder } from '@ecolect/graph';
import { LanguageGraphFactory } from '@ecolect/language';
import { combine, DateTimeData } from '@ecolect/type-datetime';

import { integerGraph } from './integerGraph';

export const dateDurationGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'date-duration',

	create(language) {
		const integer = language.graph(integerGraph);

		return new GraphBuilder<DateTimeData>(language)
			.name('date-duration')

			.skipPunctuation()

			.add([ integer, 'years' ], v => ({ relativeYears: v[0].value }))
			.add([ integer, 'yrs' ], v => ({ relativeYears: v[0].value }))
			.add([ integer, 'y' ], v => ({ relativeYears: v[0].value }))
			.add([ integer, 'quarters' ], v => ({ relativeQuarters: v[0].value }))
			.add([ integer, 'q' ], v => ({ relativeQuarters: v[0].value }))
			.add([ integer, 'weeks' ], v => ({ relativeWeeks: v[0].value }))
			.add([ integer, 'wks' ], v => ({ relativeWeeks: v[0].value }))
			.add([ integer, 'w' ], v => ({ relativeWeeks: v[0].value }))
			.add([ integer, 'months' ], v => ({ relativeMonths: v[0].value }))
			.add([ integer, 'mths' ], v => ({ relativeMonths: v[0].value }))
			.add([ integer, 'mon' ], v => ({ relativeMonths: v[0].value }))
			.add([ integer, 'm' ], v => ({ relativeMonths: v[0].value }))
			.add([ integer, 'days' ], v => ({ relativeDays: v[0].value }))
			.add([ integer, 'd' ], v => ({ relativeDays: v[0].value }))

			.add([ GraphBuilder.result(), GraphBuilder.result() ], v => combine(v[0], v[1]))
			.add([ GraphBuilder.result(), 'and', GraphBuilder.result() ], v => combine(v[0], v[1]))

			.build();
	}
};
