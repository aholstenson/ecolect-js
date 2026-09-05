import { BigDecimal } from 'numeric-types/decimal';
import { BigInteger } from 'numeric-types/integer';

import { KnownGraphs } from '../../language/index.js';
import { OrdinalData } from '../../type-numbers/index.js';
import { textsFor } from '../invertGraph.js';
import { renderer, ValueRenderer } from '../ValueRenderer.js';

/**
 * Write whole numbers as digits, such as `20`.
 *
 * @returns
 *   renderer for whole numbers
 */
export function integerRenderer(): ValueRenderer<BigInteger> {
	return renderer(value => [ value.toString() ]);
}

/**
 * Write numbers as digits. Both `2.4` and `2,4` are offered, as languages do
 * not agree on how the fractional part is separated.
 *
 * @returns
 *   renderer for numbers
 */
export function numberRenderer(): ValueRenderer<BigDecimal> {
	return renderer(value => {
		const text = value.toString();
		if(! text.includes('.')) return [ text ];

		return [ text, text.replace('.', ',') ];
	});
}

/**
 * Write ordinals. Digits come first, as every language reads them, and the
 * words the language has for the same position follow.
 *
 * @returns
 *   renderer for ordinals
 */
export function ordinalRenderer(): ValueRenderer<BigInteger> {
	return renderer((value, context) => {
		const graph = context.language.findGraph(KnownGraphs.Ordinal);
		const position = Number(value.toString());

		return [
			value.toString(),
			...textsFor<OrdinalData>(graph, data => data.value === position)
		];
	});
}
