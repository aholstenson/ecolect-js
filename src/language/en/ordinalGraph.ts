import { GraphBuilder } from '../../graph/index.js';
import type {
	OrdinalData} from '../../type-numbers/index.js';
import {
	ambiguousOrdinal,
	combineNumbers,
	literalNumber,
	specificOrdinal
} from '../../type-numbers/index.js';
import type { LanguageGraphFactory } from '../index.js';

import { integerGraph } from './integerGraph.js';

const specific = (v: any) => specificOrdinal(v[0].value);

/**
 * Ordinal words below ten. These can come after a number, as in
 * `twenty first` or `one hundred second`.
 */
const UNIT_ORDINALS = {
	'first': 1,
	'second': 2,
	'third': 3,
	'fourth': 4,
	'fifth': 5,
	'sixth': 6,
	'seventh': 7,
	'eighth': 8,
	'ninth': 9
};

export const ordinalGraph: LanguageGraphFactory<OrdinalData> = {
	id: 'ordinal',

	create(language) {
		const integer = language.graph(integerGraph);

		const units = new GraphBuilder<OrdinalData>(language)
			.name('ordinalUnit')
			.map(UNIT_ORDINALS, l => specificOrdinal(l))
			.build();

		return new GraphBuilder<OrdinalData>(language)
			.name('ordinal')

			.add(integer, v => ambiguousOrdinal(v[0].value))
			.add([ integer, 'st' ], specific)
			.add([ integer, 'nd' ], specific)
			.add([ integer, 'rd' ], specific)
			.add([ integer, 'th' ], specific)

			.add(units, v => v[0])

			.map(
				{
					'tenth': 10,
					'eleventh': 11,
					'twelfth': 12,
					'thirteenth': 13,
					'fourteenth': 14,
					'fifteenth': 15,
					'sixteenth': 16,
					'seventeenth': 17,
					'eighteenth': 18,
					'nineteenth': 19,
					'twentieth': 20,
					'thirtieth': 30,
					'fortieth': 40,
					'fiftieth': 50,
					'sixtieth': 60,
					'seventieth': 70,
					'eightieth': 80,
					'ninetieth': 90
				},
				l => specificOrdinal(l)
			)

			// A number before an ordinal word below ten, as in `twenty first`
			.add([ integer, units ], v => {
				const unit = v[1].value;
				const combined = combineNumbers(v[0], literalNumber(unit, String(unit)));
				return combined && combined.parts ? specificOrdinal(combined.value) : null;
			})

			.add([ 'the', GraphBuilder.result() ], v => v[0])

			.build();
	}
};
