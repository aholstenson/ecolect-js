import { ValueMatcherFactory } from '../ValueMatcherFactory';
import { GraphBuilder } from '../../graph/GraphBuilder';

import { map, thisQuarter, nextQuarter, previousQuarter } from '../../time/quarters';
import { ordinalMatcher } from './ordinal';
import { IntervalValue } from '../../time/interval-value';
import { DateTimeData } from '../../time/DateTimeData';

export const quarterMatcher: ValueMatcherFactory<IntervalValue> = {
	id: 'quarter',

	create(language) {
		const ordinal = language.matcher(ordinalMatcher);

		return new GraphBuilder<DateTimeData>(language)
			.name('quarter')

			.skipPunctuation()

			// Weeks relative to current time
			.add([ 'this quarter' ], thisQuarter)
			.add([ 'next quarter' ], nextQuarter)
			.add([ 'last quarter' ], previousQuarter)
			.add([ 'previous quarter' ], previousQuarter)

			.add([ 'quarter', ordinal ], v => ({ quarter: v[0].value }))
			.add([ 'q', ordinal ], v => ({ quarter: v[0].value }))
			.add([ ordinal, 'quarter' ], v => ({ quarter: v[0].value }))
			.add([ ordinal, 'q' ], v => ({ quarter: v[0].value }))

			.mapResults(map)
			.onlyBest()
			.toMatcher();
	}
};
