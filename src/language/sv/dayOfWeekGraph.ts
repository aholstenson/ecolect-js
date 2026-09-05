import { GraphBuilder } from '../../graph/index.js';
import { LanguageGraphFactory } from '../index.js';

export const dayOfWeekGraph: LanguageGraphFactory<number> = {
	id: 'day-of-week',

	create(language) {
		return new GraphBuilder<number>(language)
			.name('day-of-week')

			// Day of week
			.map(
				{
					'mån': 1,
					'måndag': 1,

					'tis': 2,
					'tisdag': 2,

					'ons': 3,
					'onsdag': 3,

					'tor': 4,
					'tors': 4,
					'torsdag': 4,

					'fre': 5,
					'fredag': 5,

					'lör': 6,
					'lördag': 6,

					'sön': 0,
					'söndag': 0
				},
				l => l
			)

			.add([ 'på', GraphBuilder.result() ], v => v[0])

			.build();
	}
};
