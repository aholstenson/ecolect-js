import { GraphBuilder } from '../../graph/index.js';
import {
	DateTimeData,

	combine
} from '../../type-datetime/index.js';
import { LanguageGraphFactory } from '../index.js';

import { dateDurationGraph } from './dateDurationGraph.js';
import { timeDurationGraph } from './timeDurationGraph.js';

export const dateTimeDurationGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'date-time-duration',

	create(language) {
		const timeDuration = language.graph(timeDurationGraph);
		const dateDuration = language.graph(dateDurationGraph);

		return new GraphBuilder<DateTimeData>(language)
			.name('date-time-duration')

			.skipPunctuation()

			.add(timeDuration, v => v[0])
			.add(dateDuration, v => v[0])

			.add([ GraphBuilder.result(), GraphBuilder.result() ], v => combine(v[0], v[1]))
			.add([ GraphBuilder.result(), 'and', GraphBuilder.result() ], v => combine(v[0], v[1]))

			.build();
	}
};
