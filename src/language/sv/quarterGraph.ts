import { GraphBuilder } from '../../graph/index.js';
import type {
	DateTimeData} from '../../type-datetime/index.js';
import {

	thisQuarter,
	nextQuarter,
	previousQuarter
} from '../../type-datetime/index.js';
import type { OrdinalData } from '../../type-numbers/index.js';
import type { LanguageGraphFactory } from '../index.js';

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
			.add([ 'detta kvartal' ], thisQuarter)
			.add([ 'det här kvartalet' ], thisQuarter)
			.add([ 'innevarande kvartal' ], thisQuarter)
			.add([ 'nästa kvartal' ], nextQuarter)
			.add([ 'kommande kvartal' ], nextQuarter)
			.add([ 'förra kvartalet' ], previousQuarter)
			.add([ 'föregående kvartal' ], previousQuarter)

			.add([ 'kvartal', ordinal ], v => ({ quarter: v[0].value }))
			.add([ 'q', ordinal ], v => ({ quarter: v[0].value }))
			.add([ ordinal, 'kvartalet' ], v => ({ quarter: v[0].value }))
			.add([ ordinal, 'kvartal' ], v => ({ quarter: v[0].value }))
			.add([ ordinal, 'q' ], v => ({ quarter: v[0].value }))

			.build();
	}
};
