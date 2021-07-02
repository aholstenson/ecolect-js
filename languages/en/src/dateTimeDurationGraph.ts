import { GraphBuilder } from '@ecolect/graph';
import { LanguageGraphFactory } from '@ecolect/language';
import {
	DateTimeData,

	combine
} from '@ecolect/type-datetime';

import { dateDurationGraph } from './dateDurationGraph';
import { timeDurationGraph } from './timeDurationGraph';

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
