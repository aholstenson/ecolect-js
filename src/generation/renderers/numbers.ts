import type { BigDecimal } from 'numeric-types/decimal';
import type { BigInteger } from 'numeric-types/integer';

import { KnownGraphs, resolveLocale } from '../../language/index.js';
import type { OrdinalData } from '../../type-numbers/index.js';
import { resolveNumberSeparators } from '../../type-numbers/index.js';
import { textsFor } from '../invertGraph.js';
import type { ValueRenderer } from '../ValueRenderer.js';
import { renderer } from '../ValueRenderer.js';

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
 * not agree on how the fractional part is separated. The first decimal
 * separator of the match comes first, so a match that reads both is written
 * as its locale writes it.
 *
 * @returns
 *   renderer for numbers
 */
export function numberRenderer(): ValueRenderer<BigDecimal> {
	return renderer((value, context) => {
		const text = value.toString();
		if(! text.includes('.')) return [ text ];

		const separators = resolveNumberSeparators(
			resolveLocale(context.options.locale ?? context.language.locale),
			{
				...context.options,
				numberSeparators: context.options.numberSeparators ?? context.language.options?.numberSeparators
			}
		);

		const written = [ text, text.replace('.', ',') ];
		return separators.decimal[0] === ',' ? written.reverse() : written;
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
