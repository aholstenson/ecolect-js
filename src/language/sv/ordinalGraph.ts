import { GraphBuilder } from '../../graph/index.js';
import {
	OrdinalData,
	ambiguousOrdinal,
	specificOrdinal
} from '../../type-numbers/index.js';
import { LanguageGraphFactory } from '../index.js';

import { integerGraph } from './integerGraph.js';
import { ORDINAL_WORDS } from './numberWords.js';

const specific = (v: any) => specificOrdinal(v[0].value);

export const ordinalGraph: LanguageGraphFactory<OrdinalData> = {
	id: 'ordinal',

	create(language) {
		const integer = language.graph(integerGraph);

		return new GraphBuilder<OrdinalData>(language)
			.name('ordinal')

			.add(integer, v => ambiguousOrdinal(v[0].value))

			/*
			 * Swedish marks a position after a digit with a colon and the
			 * last letters of the word, as in `1:a` and `3:e`. The colon is
			 * often left out when writing quickly.
			 */
			.add([ integer, ':', 'a' ], specific)
			.add([ integer, ':', 'e' ], specific)
			.add([ integer, 'a' ], specific)
			.add([ integer, 'e' ], specific)

			.map(ORDINAL_WORDS, l => specificOrdinal(l))

			.add([ 'den', GraphBuilder.result() ], v => v[0])
			.add([ 'det', GraphBuilder.result() ], v => v[0])

			.build();
	}
};
