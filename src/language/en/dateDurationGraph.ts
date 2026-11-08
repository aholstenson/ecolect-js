import { GraphBuilder } from '../../graph/index.js';
import type { DateTimeData } from '../../type-datetime/index.js';
import { combine } from '../../type-datetime/index.js';
import type { NumberData } from '../../type-numbers/index.js';
import { literalNumber } from '../../type-numbers/index.js';
import type { Language, LanguageGraphFactory } from '../index.js';

import { integerGraph } from './integerGraph.js';

/**
 * Add the rules for one amount of a date unit, such as `2 days`.
 *
 * @param language -
 *   the language the rules are for
 * @param builder -
 *   the builder to add the rules to
 * @returns
 *   the builder
 */
function addDateUnits(language: Language, builder: GraphBuilder<DateTimeData>): GraphBuilder<DateTimeData> {
	const integer = language.graph(integerGraph);

	// Number of units, either a number or an article as in "a week"
	const amount = new GraphBuilder<NumberData>(language)
		.name('date-duration-amount')

		.add(integer, v => v[0])
		.map({ a: 1, an: 1 }, l => literalNumber(l, String(l)))

		.build();

	return builder
		.add([ amount, 'years' ], v => ({ relativeYears: v[0].value }))
		.add([ integer, 'yrs' ], v => ({ relativeYears: v[0].value }))
		.add([ integer, 'y' ], v => ({ relativeYears: v[0].value }))
		.add([ amount, 'quarters' ], v => ({ relativeQuarters: v[0].value }))
		.add([ integer, 'q' ], v => ({ relativeQuarters: v[0].value }))
		.add([ amount, 'weeks' ], v => ({ relativeWeeks: v[0].value }))
		.add([ integer, 'wks' ], v => ({ relativeWeeks: v[0].value }))
		.add([ integer, 'w' ], v => ({ relativeWeeks: v[0].value }))
		.add([ amount, 'months' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'mths' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'mon' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'm' ], v => ({ relativeMonths: v[0].value }))
		.add([ amount, 'days' ], v => ({ relativeDays: v[0].value }))
		.add([ integer, 'd' ], v => ({ relativeDays: v[0].value }));
}

/**
 * One amount of a date unit, such as `2 days`.
 */
export const dateDurationUnitGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'date-duration-unit',

	create(language) {
		return addDateUnits(language, new GraphBuilder<DateTimeData>(language)
			.name('date-duration-unit')
			.skipPunctuation()
		).build();
	}
};

/**
 * A duration in date units, such as `2 weeks and 3 days`.
 */
export const dateDurationGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'date-duration',

	create(language) {
		const unit = language.graph(dateDurationUnitGraph);

		/*
		 * Units are added one at a time from left to right, so that a list
		 * of units can be read in only one way. If a list could be combined
		 * with a list, the ways to read a long list would grow very fast.
		 * The rules for one unit are also in this graph, so that text
		 * generation finds the words for each unit.
		 */
		return addDateUnits(language, new GraphBuilder<DateTimeData>(language)
			.name('date-duration')
			.skipPunctuation()
		)
			.add([ GraphBuilder.result(), unit ], v => combine(v[0], v[1]))
			.add([ GraphBuilder.result(), 'and', unit ], v => combine(v[0], v[1]))

			.build();
	}
};
