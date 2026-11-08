import { GraphBuilder } from '../../graph/index.js';
import type {
	DateTimeData} from '../../type-datetime/index.js';
import {

	addDurations
} from '../../type-datetime/index.js';
import type { LanguageGraphFactory } from '../index.js';

import { dateDurationUnitGraph } from './dateDurationGraph.js';
import { timeDurationUnitGraph } from './timeDurationGraph.js';

export const dateTimeDurationGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'date-time-duration',

	create(language) {
		const timeUnit = language.graph(timeDurationUnitGraph);
		const dateUnit = language.graph(dateDurationUnitGraph);

		/*
		 * Units are added one at a time from left to right, so that a list
		 * of units can be read in only one way. If a list could be combined
		 * with a list, the ways to read a long list would grow very fast.
		 */
		return new GraphBuilder<DateTimeData>(language)
			.name('date-time-duration')

			.skipPunctuation()

			.add(timeUnit, v => v[0])
			.add(dateUnit, v => v[0])

			.add([ GraphBuilder.result(), timeUnit ], v => addDurations(v[0], v[1]))
			.add([ GraphBuilder.result(), dateUnit ], v => addDurations(v[0], v[1]))
			.add([ GraphBuilder.result(), 'och', timeUnit ], v => addDurations(v[0], v[1]))
			.add([ GraphBuilder.result(), 'och', dateUnit ], v => addDurations(v[0], v[1]))

			.build();
	}
};
