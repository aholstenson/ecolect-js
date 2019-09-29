import { LanguageGraphFactory } from '../LanguageGraphFactory';

import { GraphBuilder } from '../../graph/GraphBuilder';

import { ordinalGraph } from './ordinalGraph';

import { thisQuarter, nextQuarter, previousQuarter } from '../../time/quarters';
import { DateTimeData } from '../../time/DateTimeData';

export const quarterGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'quarter',

	create(language) {
		const ordinal = language.graph(ordinalGraph);

		return new GraphBuilder<DateTimeData>(language)
			.name('quarter')

			.skipPunctuation()

			// Weeks relative to current time
			.add([ 'this quarter' ], thisQuarter)
			.add([ 'next quarter' ], nextQuarter)
			.add([ 'last quarter' ], previousQuarter)
			.add([ 'previous quarter' ], previousQuarter)

			.add([ 'quarter', ordinal ], v => ({ quarter: v[0].value }))
			.add([ 'q', ordinal ], v => ({ quarter: v[0].value }))
			.add([ ordinal, 'quarter' ], v => ({ quarter: v[0].value }))
			.add([ ordinal, 'q' ], v => ({ quarter: v[0].value }))

			.build();
	}
};
