import { Language } from '../language';
import { ValueMatcherFactory } from '../value-matcher-factory';
import { GraphBuilder } from '../../graph/builder';
import { Matcher } from '../../graph/matching';

import { integerMatcher } from './integer';

import { OrdinalValue } from '../../numbers/ordinal-value';
import { OrdinalData } from '../../numbers/ordinal-data';
import { map, specificOrdinal, ambigiousOrdinal } from '../../numbers/ordinals';

const specific = (v: any) => specificOrdinal(v[0].value);

export const ordinalMatcher: ValueMatcherFactory<OrdinalValue> = {
	id: 'ordinal',

	create(language: Language): Matcher<OrdinalValue | null> {
		const integer = language.matcher(integerMatcher);

		return new GraphBuilder<OrdinalData>(language)
			.name('ordinal')

			.add(integer, v => ambigiousOrdinal(v[0].value))
			.add([ integer, 'st' ], specific)
			.add([ integer, 'nd' ], specific)
			.add([ integer, 'rd' ], specific)
			.add([ integer, 'th' ], specific)

			.map(
				{
					'first': 1,
					'second': 2,
					'third': 3,
					'fourth': 4,
					'fifth': 5,
					'sixth': 6,
					'seventh': 7,
					'eight': 8,
					'ninth': 9,
					'tenth': 10
				},
				l => specificOrdinal(l)
			)

			.add([ 'the', GraphBuilder.result() ], v => v[0])

			.mapResults(map)
			.onlyBest()
			.toMatcher();
	}
};
