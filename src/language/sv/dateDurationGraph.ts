import { GraphBuilder } from '../../graph/index.js';
import type { DateTimeData } from '../../type-datetime/index.js';
import { combine } from '../../type-datetime/index.js';
import type { Language, LanguageGraphFactory } from '../index.js';

import { integerGraph } from './integerGraph.js';

/**
 * Add the rules for one amount of a date unit, such as `2 dagar`.
 *
 * @param language -
 *   the language the rules are for
 * @param builder -
 *   the builder to add the rules to
 * @returns
 *   the builder
 */
function addDateUnits(language: Language, builder: GraphBuilder<DateTimeData>): GraphBuilder<DateTimeData> {
	/*
	 * The amount of units. `en` and `ett` are the words for one, so
	 * `en vecka` counts as a week without a rule of its own.
	 */
	const integer = language.graph(integerGraph);

	return builder
		.add([ integer, 'år' ], v => ({ relativeYears: v[0].value }))
		.add([ integer, 'kvartal' ], v => ({ relativeQuarters: v[0].value }))
		.add([ integer, 'kv' ], v => ({ relativeQuarters: v[0].value }))
		.add([ integer, 'q' ], v => ({ relativeQuarters: v[0].value }))
		.add([ integer, 'veckor' ], v => ({ relativeWeeks: v[0].value }))
		.add([ integer, 'vecka' ], v => ({ relativeWeeks: v[0].value }))
		.add([ integer, 'v' ], v => ({ relativeWeeks: v[0].value }))
		.add([ integer, 'w' ], v => ({ relativeWeeks: v[0].value }))
		.add([ integer, 'månader' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'månad' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'mån' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'm' ], v => ({ relativeMonths: v[0].value }))
		.add([ integer, 'dagar' ], v => ({ relativeDays: v[0].value }))
		.add([ integer, 'dag' ], v => ({ relativeDays: v[0].value }))
		.add([ integer, 'd' ], v => ({ relativeDays: v[0].value }));
}

/**
 * One amount of a date unit, such as `2 dagar`.
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
 * A duration in date units, such as `2 veckor och 3 dagar`.
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
			.add([ GraphBuilder.result(), 'och', unit ], v => combine(v[0], v[1]))

			.build();
	}
};
