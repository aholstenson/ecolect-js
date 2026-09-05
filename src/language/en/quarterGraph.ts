import { GraphBuilder } from '../../graph/index.js';
import {
	DateTimeData,

	thisQuarter,
	nextQuarter,
	previousQuarter
} from '../../type-datetime/index.js';
import { OrdinalData } from '../../type-numbers/index.js';
import { LanguageGraphFactory } from '../index.js';

import { ordinalGraph } from './ordinalGraph.js';

export const quarterGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'quarter',

	create(language) {
		// Only four quarters exist in a year
		const ordinal = GraphBuilder.result<OrdinalData>(language.graph(ordinalGraph), v => v.value >= 1 && v.value <= 4);

		return new GraphBuilder<DateTimeData>(language)
			.name('quarter')

			.skipPunctuation()

			// Quarters relative to current time
			.add([ 'this quarter' ], thisQuarter)
			.add([ 'next quarter' ], nextQuarter)
			.add([ 'last quarter' ], previousQuarter)
			.add([ 'previous quarter' ], previousQuarter)

			.add([ 'quarter', ordinal ], v => ({ quarter: v[0].value }))
			.add([ 'q', ordinal ], v => ({ quarter: v[0].value }))
			.add([ ordinal, 'quarter' ], v => ({ quarter: v[0].value }))
			.add([ ordinal, 'q' ], v => ({ quarter: v[0].value }))

			.build();
	}
};
