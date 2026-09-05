import { GraphBuilder } from '@ecolect/graph';
import { LanguageGraphFactory } from '@ecolect/language';
import { combine, DateTimeData } from '@ecolect/type-datetime';
import { literalNumber, NumberData } from '@ecolect/type-numbers';

import { integerGraph } from './integerGraph.js';

export const dateDurationGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'date-duration',

	create(language) {
		const integer = language.graph(integerGraph);

		// Number of units, either a number or an article as in "a week"
		const amount = new GraphBuilder<NumberData>(language)
			.name('date-duration-amount')

			.add(integer, v => v[0])
			.map({ a: 1, an: 1 }, l => literalNumber(l, String(l)))

			.build();

		return new GraphBuilder<DateTimeData>(language)
			.name('date-duration')

			.skipPunctuation()

			.add([ amount, 'years' ], v => ({ relativeYears: v[0].value }))
			.add([ integer, 'yrs' ], v => ({ relativeYears: v[0].value }))
			.add([ integer, 'y' ], v => ({ relativeYears: v[0].value }))
			.add([ amount, 'quarters' ], v => ({ relativeQuarters: v[0].value }))
			.add([ integer, 'q' ], v => ({ relativeQuarters: v[0].value }))
			.add([ amount, 'weeks' ], v => ({ relativeWeeks: v[0].value }))
			.add([ integer, 'wks' ], v => ({ relativeWeeks: v[0].value }))
			.add([ integer, 'w' ], v => ({ relativeWeeks: v[0].value }))
			.add([ amount, 'months' ], v => ({ relativeMonths: v[0].value }))
			.add([ integer, 'mths' ], v => ({ relativeMonths: v[0].value }))
			.add([ integer, 'mon' ], v => ({ relativeMonths: v[0].value }))
			.add([ integer, 'm' ], v => ({ relativeMonths: v[0].value }))
			.add([ amount, 'days' ], v => ({ relativeDays: v[0].value }))
			.add([ integer, 'd' ], v => ({ relativeDays: v[0].value }))

			.add([ GraphBuilder.result(), GraphBuilder.result() ], v => combine(v[0], v[1]))
			.add([ GraphBuilder.result(), 'and', GraphBuilder.result() ], v => combine(v[0], v[1]))

			.build();
	}
};
