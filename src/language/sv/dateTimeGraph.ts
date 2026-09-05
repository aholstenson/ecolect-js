import { GraphBuilder } from '../../graph/index.js';
import {
	combine,
	DateTimeData,
	isRelative
} from '../../type-datetime/index.js';
import { LanguageGraphFactory } from '../index.js';

import { dateGraph } from './dateGraph.js';
import { timeGraph } from './timeGraph.js';

export const dateTimeGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'date-time',

	create(language) {
		const time = language.graph(timeGraph);
		const date = language.graph(dateGraph);

		return new GraphBuilder<DateTimeData>(language)
			.name('date-time')

			.skipPunctuation()

			.add(time, v => v[0])
			.add(date, v => v[0])

			.add([ time, date ], v => combine(v[0], v[1]))
			.add([ time, 'och', date ], v => combine(v[0], v[1]))

			.add([ date, time ], v => combine(v[0], v[1]))
			.add([ date, 'och', time ], v => combine(v[0], v[1]))

			.add(GraphBuilder.result(date, isRelative), (v, e) => v[0])

			.build();
	}
};
