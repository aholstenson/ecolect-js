import { LanguageGraphFactory } from '../LanguageGraphFactory';
import { Language } from '../Language';

import { GraphBuilder } from '../../graph/GraphBuilder';

import { ordinalGraph } from './ordinalGraph';
import { integerGraph } from './integerGraph';

import { DateTimeData } from '../../time/DateTimeData';
import { OrdinalData } from '../../numbers/OrdinalData';

import { reverse } from '../../time/matching';
import { thisMonth, nextMonth, previousMonth } from '../../time/months';

import { isSpecific } from '../../numbers/ordinals';

export const monthGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'month',

	create(language: Language) {
		const integer = language.graph(integerGraph);
		const ordinal = language.graph(ordinalGraph);
		const ordinalMonth = GraphBuilder.result<OrdinalData>(ordinal, v => isSpecific(v) && v.value >= 1 && v.value <= 12);

		const relative = new GraphBuilder<DateTimeData>(language)
			.name('relativeMonths')

			.add([ integer, 'months' ], v => ({ relativeMonths: v[0].value }))

			.build();

		return new GraphBuilder<DateTimeData>(language)
			.name('month')

			.skipPunctuation()

			// Named months
			.map(
				{
					'jan': 0,
					'january': 0,

					'feb': 1,
					'february': 1,

					'mar': 2,
					'march': 2,

					'apr': 3,
					'april': 3,

					'may': 4,

					'jun': 5,
					'june': 5,

					'jul': 6,
					'july': 6,

					'aug': 7,
					'august': 7,

					'sep': 8,
					'sept': 8,
					'september': 8,

					'oct': 9,
					'october': 9,

					'nov': 10,
					'november': 10,

					'dec': 11,
					'december': 11
				},
				l => ({ month: l })
			)

			// Dynamic months
			.add('this month', thisMonth)
			.add('previous month', previousMonth)
			.add('last month', previousMonth)
			.add('next month', nextMonth)

			.add([ relative ], v => v[0])

			// Numbered months
			.add([ ordinalMonth, 'month' ], v => ({ month: v[0].value - 1 }))
			.add([ ordinalMonth ], v => ({ month: v[0].value - 1, }))

			.add([ 'in', GraphBuilder.result() ], v => v[0])
			.add([ relative, 'ago' ], v => reverse(v[0]))

			.build();
	}
};
