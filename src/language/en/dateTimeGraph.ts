import { GraphBuilder } from '../../graph/index.js';
import {
	asTime,
	combineDateAndTime,
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

			.add(time, v => asTime(v[0]))
			.add(date, v => v[0])

			.add([ time, date ], v => combineDateAndTime(v[1], v[0]))
			.add([ time, 'and', date ], v => combineDateAndTime(v[1], v[0]))

			.add([ date, time ], v => combineDateAndTime(v[0], v[1]))
			.add([ date, 'and', time ], v => combineDateAndTime(v[0], v[1]))

			.add(GraphBuilder.result(date, isRelative), (v, e) => v[0])

			.build();
	}
};
