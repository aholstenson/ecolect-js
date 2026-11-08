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
import { ORDINAL_SCALE_WORDS, ORDINAL_WORDS } from './numberWords.js';

const specific = (v: any) => specificOrdinal(v[0].value);

export const ordinalGraph: LanguageGraphFactory<OrdinalData> = {
	id: 'ordinal',

	create(language) {
		const integer = language.graph(integerGraph);

		const words = new GraphBuilder<OrdinalData>(language)
			.name('ordinalWord')
			.map(ORDINAL_WORDS, l => specificOrdinal(l))
			.build();

		const scales = new GraphBuilder<OrdinalData>(language)
			.name('ordinalScale')
			.map(ORDINAL_SCALE_WORDS, l => specificOrdinal(l))
			.build();

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

			.add(words, v => v[0])
			.add(scales, v => v[0])

			/*
			 * A number before a position below 100, as in `hundra femte`.
			 * The tokenizer splits `tvåhundrafemte` into such words. The
			 * number must end in a scale word or a whole ten, so that `fem
			 * första` is not read as the 51st.
			 */
			.add([ integer, words ], v => {
				const position = v[1].value;
				const combined = combineNumbers(v[0], literalNumber(position, String(position)));
				return combined && combined.parts ? specificOrdinal(combined.value) : null;
			})

			// A number before the position of a scale word, as in `två hundrade`
			.add([ integer, scales ], v => {
				const scale = v[1].value;
				const combined = combineNumbers(v[0], literalNumber(scale, String(scale), true));
				return combined ? specificOrdinal(combined.value) : null;
			})

			.add([ 'den', GraphBuilder.result() ], v => v[0])
			.add([ 'det', GraphBuilder.result() ], v => v[0])

			.build();
	}
};
