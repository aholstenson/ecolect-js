import { LanguageGraphFactory } from '../LanguageGraphFactory';
import { GraphBuilder } from '../../graph/GraphBuilder';

import { combine } from '../../time/matching';
import { DateTimeData } from '../../time/DateTimeData';

import { timeDurationGraph } from './timeDurationGraph';
import { dateDurationGraph } from './dateDurationGraph';

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
