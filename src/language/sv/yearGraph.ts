import { GraphBuilder } from '../../graph/index.js';
import {
	DateTimeData,

	reverse,

	thisYear,
	nextYear,
	previousYear
} from '../../type-datetime/index.js';
import { LanguageGraphFactory } from '../index.js';

import { integerGraph } from './integerGraph.js';

export const yearGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'year',

	create(language) {
		const integer = language.graph(integerGraph);

		const relative = new GraphBuilder<DateTimeData>(language)
			.name('relativeYears')

			.add([ integer, 'år' ], v => ({ relativeYears: v[0].value }))

			.build();

		return new GraphBuilder<DateTimeData>(language)
			.name('year')

			.add([ /^[0-9]{4}$/ ], v => ({ year: parseInt(v[0], 10) }))
			.add([ 'år', /^[0-9]{4}$/ ], v => ({ year: parseInt(v[0], 10) }))
			.add([ 'året', /^[0-9]{4}$/ ], v => ({ year: parseInt(v[0], 10) }))
			.add('i år', thisYear)
			.add('detta år', thisYear)
			.add('det här året', thisYear)
			.add('innevarande år', thisYear)
			.add('nästa år', nextYear)
			.add('kommande år', nextYear)
			.add('förra året', previousYear)
			.add('föregående år', previousYear)
			.add('i fjol', previousYear)

			.add(relative, v => v[0])

			.add([ 'i', GraphBuilder.result() ], v => v[0])
			.add([ 'av', GraphBuilder.result() ], v => v[0])
			.add([ 'om', GraphBuilder.result() ], v => v[0])
			.add([ relative, 'sedan' ], v => reverse(v[0]))

			.build();
	}
};
