import { GraphBuilder } from '../../graph/index.js';
import { combine, DateTimeData } from '../../type-datetime/index.js';
import { LanguageGraphFactory } from '../index.js';

import { integerGraph } from './integerGraph.js';

export const dateDurationGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'date-duration',

	create(language) {
		/*
		 * The amount of units. `en` and `ett` are the words for one, so
		 * `en vecka` counts as a week without a rule of its own.
		 */
		const integer = language.graph(integerGraph);

		return new GraphBuilder<DateTimeData>(language)
			.name('date-duration')

			.skipPunctuation()

			.add([ integer, 'år' ], v => ({ relativeYears: v[0].value }))
			.add([ integer, 'kvartal' ], v => ({ relativeQuarters: v[0].value }))
			.add([ integer, 'kv' ], v => ({ relativeQuarters: v[0].value }))
			.add([ integer, 'q' ], v => ({ relativeQuarters: v[0].value }))
			.add([ integer, 'veckor' ], v => ({ relativeWeeks: v[0].value }))
			.add([ integer, 'vecka' ], v => ({ relativeWeeks: v[0].value }))
			.add([ integer, 'v' ], v => ({ relativeWeeks: v[0].value }))
			.add([ integer, 'w' ], v => ({ relativeWeeks: v[0].value }))
			.add([ integer, 'månader' ], v => ({ relativeMonths: v[0].value }))
			.add([ integer, 'månad' ], v => ({ relativeMonths: v[0].value }))
			.add([ integer, 'mån' ], v => ({ relativeMonths: v[0].value }))
			.add([ integer, 'm' ], v => ({ relativeMonths: v[0].value }))
			.add([ integer, 'dagar' ], v => ({ relativeDays: v[0].value }))
			.add([ integer, 'dag' ], v => ({ relativeDays: v[0].value }))
			.add([ integer, 'd' ], v => ({ relativeDays: v[0].value }))

			.add([ GraphBuilder.result(), GraphBuilder.result() ], v => combine(v[0], v[1]))
			.add([ GraphBuilder.result(), 'och', GraphBuilder.result() ], v => combine(v[0], v[1]))

			.build();
	}
};
