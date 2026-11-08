import { GraphBuilder } from '../../graph/index.js';
import type {
	DateTimeData} from '../../type-datetime/index.js';
import {
	nextMonth,
	previousMonth,
	thisMonth,
	reverse
} from '../../type-datetime/index.js';
import type { OrdinalData } from '../../type-numbers/index.js';
import { isSpecific } from '../../type-numbers/index.js';
import type { LanguageGraphFactory } from '../index.js';

import { integerGraph } from './integerGraph.js';
import { MONTH_NAMES } from './monthNames.js';
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
			.map(MONTH_NAMES, l => ({ month: l }))

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
