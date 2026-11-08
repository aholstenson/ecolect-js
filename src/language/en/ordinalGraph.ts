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

/**
 * Get the suffix that a number takes as an ordinal, such as `st` for 21 and
 * `th` for 11.
 *
 * @param value -
 *   the number
 * @returns
 *   the suffix of the number
 */
function suffixOf(value: number): string {
	const lastTwo = Math.abs(value) % 100;
	if(lastTwo >= 11 && lastTwo <= 13) return 'th';

	switch(lastTwo % 10) {
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		default:
			return 'th';
	}
}

/**
 * Create the value of a number followed by an ordinal suffix. Only the
 * suffix of the number gives a value, so `21st` is an ordinal but `21th` is
 * not.
 *
 * @param suffix -
 *   the suffix that follows the number
 * @returns
 *   function that reads the ordinal
 */
function withSuffix(suffix: string) {
	return (v: any) => suffixOf(v[0].value) === suffix ? specificOrdinal(v[0].value) : null;
}

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
			.add([ integer, 'st' ], withSuffix('st'))
			.add([ integer, 'nd' ], withSuffix('nd'))
			.add([ integer, 'rd' ], withSuffix('rd'))
			.add([ integer, 'th' ], withSuffix('th'))

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
