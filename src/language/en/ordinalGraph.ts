import { Language } from '../Language';

import { LanguageGraphFactory } from '../LanguageGraphFactory';
import { GraphBuilder } from '../../graph/GraphBuilder';
import { Graph } from '../../graph/Graph';

import { integerGraph } from './integerGraph';

import { OrdinalData } from '../../numbers/OrdinalData';
import { specificOrdinal, ambiguousOrdinal } from '../../numbers/ordinals';

const specific = (v: any) => specificOrdinal(v[0].value);

export const ordinalGraph: LanguageGraphFactory<OrdinalData> = {
	id: 'ordinal',

	create(language: Language): Graph<OrdinalData> {
		const integer = language.graph(integerGraph);

		return new GraphBuilder<OrdinalData>(language)
			.name('ordinal')

			.add(integer, v => ambiguousOrdinal(v[0].value))
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

			.build();
	}
};
