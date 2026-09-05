import { GraphBuilder } from '../../graph/index.js';
import {
	DateTimeData,

	combine
} from '../../type-datetime/index.js';
import { LanguageGraphFactory } from '../index.js';

import { integerGraph } from './integerGraph.js';

export const timeDurationGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'time-duration',

	create(language) {
		const integer = language.graph(integerGraph);

		return new GraphBuilder<DateTimeData>(language)
			.name('time-duration')

			.skipPunctuation()

			.add([ integer, 'timmar' ], v => ({ relativeHours: v[0].value }))
			.add([ integer, 'timme' ], v => ({ relativeHours: v[0].value }))
			.add([ integer, 'tim' ], v => ({ relativeHours: v[0].value }))
			.add([ integer, 'h' ], v => ({ relativeHours: v[0].value }))
			.add([ integer, 't' ], v => ({ relativeHours: v[0].value }))
			.add([ integer, 'minuter' ], v => ({ relativeMinutes: v[0].value }))
			.add([ integer, 'minut' ], v => ({ relativeMinutes: v[0].value }))
			.add([ integer, 'min' ], v => ({ relativeMinutes: v[0].value }))
			.add([ integer, 'm' ], v => ({ relativeMinutes: v[0].value }))
			.add([ integer, 'sekunder' ], v => ({ relativeSeconds: v[0].value }))
			.add([ integer, 'sekund' ], v => ({ relativeSeconds: v[0].value }))
			.add([ integer, 'sek' ], v => ({ relativeSeconds: v[0].value }))
			.add([ integer, 's' ], v => ({ relativeSeconds: v[0].value }))
			.add([ integer, 'millisekunder' ], v => ({ relativeMilliseconds: v[0].value }))
			.add([ integer, 'millisekund' ], v => ({ relativeMilliseconds: v[0].value }))
			.add([ integer, 'ms' ], v => ({ relativeMilliseconds: v[0].value }))

			.add([ GraphBuilder.result(), GraphBuilder.result() ], v => combine(v[0], v[1]))
			.add([ GraphBuilder.result(), 'och', GraphBuilder.result() ], v => combine(v[0], v[1]))

			.build();
	}
};
