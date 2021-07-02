import { GraphBuilder } from '@ecolect/graph';
import { LanguageGraphFactory } from '@ecolect/language';
import {
	DateTimeData,

	reverse,

	thisYear,
	nextYear,
	previousYear
} from '@ecolect/type-datetime';

import { integerGraph } from './integerGraph';

export const yearGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'year',

	create(language) {
		const integer = language.graph(integerGraph);

		const relative = new GraphBuilder<DateTimeData>(language)
			.name('relativeYears')

			.add([ integer, 'years' ], v => ({ relativeYears: v[0].value }))

			.build();

		return new GraphBuilder<DateTimeData>(language)
			.name('year')

			.add([ /^[0-9]{4}$/ ], v => ({ year: parseInt(v[0], 10) }))
			.add('this year', thisYear)
			.add('next year', nextYear)
			.add('last year', previousYear)
			.add('previous year', previousYear)

			.add(relative, v => v[0])

			.add([ 'in', GraphBuilder.result() ], v => v[0])
			.add([ 'of', GraphBuilder.result() ], v => v[0])
			.add([ relative, 'ago' ], v => reverse(v[0]))

			.build();
	}
};
