import { ValueMatcherFactory } from '../value-matcher-factory';
import { GraphBuilder } from '../../graph/builder';
import { DateTimeData } from '../../time/date-time-data';

import { integerMatcher } from './integer';

import { reverse } from '../../time/matching';
import { map, thisYear, nextYear, previousYear } from '../../time/years';
import { DateValue } from '../../time/date-value';

export const yearMatcher: ValueMatcherFactory<DateValue> = {
	id: 'year',

	create(language) {
		const integer = language.matcher(integerMatcher);

		const relative = new GraphBuilder<DateTimeData>(language)
			.name('relativeYears')

			.add([ integer, 'years' ], v => ({ relativeYears: v[0].value }))

			.toMatcher();

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

			.mapResults(map)
			.onlyBest()
			.toMatcher();
	}
}
