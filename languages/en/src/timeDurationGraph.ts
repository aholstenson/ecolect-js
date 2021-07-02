import { GraphBuilder } from '@ecolect/graph';
import { LanguageGraphFactory } from '@ecolect/language';
import {
	DateTimeData,

	combine
} from '@ecolect/type-datetime';

import { integerGraph } from './integerGraph';

export const timeDurationGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'time-duration',

	create(language) {
		const integer = language.graph(integerGraph);

		return new GraphBuilder<DateTimeData>(language)
			.name('time-duration')

			.skipPunctuation()

			.add([ integer, 'hours' ], v => ({ relativeHours: v[0].value }))
			.add([ integer, 'hr' ], v => ({ relativeHours: v[0].value }))
			.add([ integer, 'h' ], v => ({ relativeHours: v[0].value }))
			.add([ integer, 'minutes' ], v => ({ relativeMinutes: v[0].value }))
			.add([ integer, 'm' ], v => ({ relativeMinutes: v[0].value }))
			.add([ integer, 'seconds' ], v => ({ relativeSeconds: v[0].value }))
			.add([ integer, 'sec' ], v => ({ relativeSeconds: v[0].value }))
			.add([ integer, 's' ], v => ({ relativeSeconds: v[0].value }))
			.add([ integer, 'milliseconds'], v => ({ relativeMilliseconds: v[0].value }))
			.add([ integer, 'millis'], v => ({ relativeMilliseconds: v[0].value }))
			.add([ integer, 'ms'], v => ({ relativeMilliseconds: v[0].value }))

			.add([ GraphBuilder.result(), GraphBuilder.result() ], v => combine(v[0], v[1]))
			.add([ GraphBuilder.result(), 'and', GraphBuilder.result() ], v => combine(v[0], v[1]))

			.build();
	}
};
