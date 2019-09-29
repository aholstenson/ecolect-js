import { LanguageGraphFactory } from '../LanguageGraphFactory';
import { GraphBuilder } from '../../graph/GraphBuilder';

import { DateTimeData } from '../../time/DateTimeData';

import { combine, isRelative } from '../../time/matching';

import { dateGraph } from './dateGraph';
import { timeGraph } from './timeGraph';

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
			.add([ time, 'and', date ], v => combine(v[0], v[1]))

			.add([ date, time ], v => combine(v[0], v[1]))
			.add([ date, 'and', time ], v => combine(v[0], v[1]))

			.add(GraphBuilder.result(date, isRelative), (v, e) => v[0])

			.build();
	}
};
