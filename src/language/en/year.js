import GraphBuilder from '../../graph/builder';

import { reverse } from '../../time/matching';
import { map, thisYear, nextYear, previousYear } from '../../time/years';

export default function(language) {
	const integer = language.integer;

	const relative = new GraphBuilder(language)
		.name('relativeYears')

		.add([ integer, 'years' ], v => ({ relativeYears: v[0].value }))

		.toMatcher();

	return new GraphBuilder(language)
		.name('year')

		.add([ /^[0-9]{4}$/ ], v => ({ year: parseInt(v[0]) }))
		.add('this year', thisYear)
		.add('next year', nextYear)
		.add('last year', previousYear)
		.add('previous year', previousYear)

		.add(relative, v => v[0])

		.add([ 'in', GraphBuilder.result() ], v => v[0])
		.add([ 'of', GraphBuilder.result() ], v => v[0])
		.add([ relative, 'ago' ], reverse)

		.mapResults(map)
		.onlyBest()
		.toMatcher();
}
