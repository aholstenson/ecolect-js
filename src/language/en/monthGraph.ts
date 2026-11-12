import { GraphBuilder } from '../../graph/index.js';
import type {
	DateTimeData} from '../../type-datetime/index.js';
import {
	nextMonth,
	monthAfterNext,
	previousMonth,
	thisMonth,
	reverse,
	isUnqualified,
	withQualifier
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

			.add([ integer, 'months' ], v => ({ relativeMonths: v[0].value }))

			.build();

		return new GraphBuilder<DateTimeData>(language)
			.name('month')

			.skipPunctuation()

			// Named months
			.map(MONTH_NAMES, l => ({ month: l }))

			// Dynamic months
			.add('this month', thisMonth)
			.add('previous month', previousMonth)
			.add('last month', previousMonth)
			.add('next month', nextMonth)
			.add('month after next', monthAfterNext)
			.add('the month after next', monthAfterNext)

			.add([ relative ], v => v[0])

			// Numbered months
			.add([ ordinalMonth, 'month' ], v => ({ month: v[0].value - 1 }))
			.add([ ordinalMonth ], v => ({ month: v[0].value - 1, }))

			.add([ 'in', GraphBuilder.result(isUnqualified) ], v => withQualifier(v[0]))
			.add([ 'of', GraphBuilder.result() ], v => v[0])
			.add([ relative, 'ago' ], v => reverse(v[0]))

			.build();
	}
};
