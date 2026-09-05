import { GraphBuilder } from '../../graph/index.js';
import {
	DateTimeData,
	nextMonth,
	previousMonth,
	thisMonth,
	reverse
} from '../../type-datetime/index.js';
import { isSpecific, OrdinalData } from '../../type-numbers/index.js';
import { LanguageGraphFactory } from '../index.js';

import { integerGraph } from './integerGraph.js';
import { ordinalGraph } from './ordinalGraph.js';

export const monthGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'month',

	create(language) {
		const integer = language.graph(integerGraph);
		const ordinal = language.graph(ordinalGraph);
		const ordinalMonth = GraphBuilder.result<OrdinalData>(ordinal, v => isSpecific(v) && v.value >= 1 && v.value <= 12);

		const relative = new GraphBuilder<DateTimeData>(language)
			.name('relativeMonths')

			.add([ integer, 'månader' ], v => ({ relativeMonths: v[0].value }))
			.add([ integer, 'månad' ], v => ({ relativeMonths: v[0].value }))

			.build();

		return new GraphBuilder<DateTimeData>(language)
			.name('month')

			.skipPunctuation()

			// Named months
			.map(
				{
					'jan': 0,
					'januari': 0,

					'feb': 1,
					'februari': 1,

					'mar': 2,
					'mars': 2,

					'apr': 3,
					'april': 3,

					'maj': 4,

					'jun': 5,
					'juni': 5,

					'jul': 6,
					'juli': 6,

					'aug': 7,
					'augusti': 7,

					'sep': 8,
					'sept': 8,
					'september': 8,

					'okt': 9,
					'oktober': 9,

					'nov': 10,
					'november': 10,

					'dec': 11,
					'december': 11
				},
				l => ({ month: l })
			)

			// Dynamic months
			.add('denna månad', thisMonth)
			.add('denna månaden', thisMonth)
			.add('den här månaden', thisMonth)
			.add('innevarande månad', thisMonth)
			.add('förra månaden', previousMonth)
			.add('föregående månad', previousMonth)
			.add('nästa månad', nextMonth)
			.add('nästa månaden', nextMonth)
			.add('kommande månad', nextMonth)

			.add([ relative ], v => v[0])

			// Numbered months
			.add([ ordinalMonth, 'månaden' ], v => ({ month: v[0].value - 1 }))
			.add([ ordinalMonth ], v => ({ month: v[0].value - 1, }))

			.add([ 'i', GraphBuilder.result() ], v => v[0])
			.add([ 'av', GraphBuilder.result() ], v => v[0])
			.add([ 'om', GraphBuilder.result() ], v => v[0])
			.add([ relative, 'sedan' ], v => reverse(v[0]))

			.build();
	}
};
