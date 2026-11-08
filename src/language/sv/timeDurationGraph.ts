import { GraphBuilder } from '../../graph/index.js';
import type {
	DateTimeData} from '../../type-datetime/index.js';
import {

	addDurations
} from '../../type-datetime/index.js';
import type { Language, LanguageGraphFactory } from '../index.js';

import { integerGraph } from './integerGraph.js';

/**
 * Add the rules for one amount of a time unit, such as `2 timmar`.
 *
 * @param language -
 *   the language the rules are for
 * @param builder -
 *   the builder to add the rules to
 * @returns
 *   the builder
 */
function addTimeUnits(language: Language, builder: GraphBuilder<DateTimeData>): GraphBuilder<DateTimeData> {
	const integer = language.graph(integerGraph);

	return builder
		.add([ integer, 'timmar' ], v => ({ relativeHours: v[0].value }))
		.add([ integer, 'timme' ], v => ({ relativeHours: v[0].value }))
		.add([ integer, 'tim' ], v => ({ relativeHours: v[0].value }))
		.add([ integer, 'h' ], v => ({ relativeHours: v[0].value }))
		.add([ integer, 't' ], v => ({ relativeHours: v[0].value }))
		.add([ integer, 'minuter' ], v => ({ relativeMinutes: v[0].value }))
		.add([ integer, 'minut' ], v => ({ relativeMinutes: v[0].value }))
		.add([ integer, 'min' ], v => ({ relativeMinutes: v[0].value }))
		.add([ integer, 'm' ], v => ({ relativeMinutes: v[0].value }))
		.add([ integer, 'sekunder' ], v => ({ relativeSeconds: v[0].value }))
		.add([ integer, 'sekund' ], v => ({ relativeSeconds: v[0].value }))
		.add([ integer, 'sek' ], v => ({ relativeSeconds: v[0].value }))
		.add([ integer, 's' ], v => ({ relativeSeconds: v[0].value }))
		.add([ integer, 'millisekunder' ], v => ({ relativeMilliseconds: v[0].value }))
		.add([ integer, 'millisekund' ], v => ({ relativeMilliseconds: v[0].value }))
		.add([ integer, 'ms' ], v => ({ relativeMilliseconds: v[0].value }));
}

/**
 * One amount of a time unit, such as `2 timmar`.
 */
export const timeDurationUnitGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'time-duration-unit',

	create(language) {
		return addTimeUnits(language, new GraphBuilder<DateTimeData>(language)
			.name('time-duration-unit')
			.skipPunctuation()
		).build();
	}
};

/**
 * A duration in time units, such as `2 timmar och 30 minuter`.
 */
export const timeDurationGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'time-duration',

	create(language) {
		const unit = language.graph(timeDurationUnitGraph);

		/*
		 * Units are added one at a time from left to right, so that a list
		 * of units can be read in only one way. If a list could be combined
		 * with a list, the ways to read a long list would grow very fast.
		 * The rules for one unit are also in this graph, so that text
		 * generation finds the words for each unit.
		 */
		return addTimeUnits(language, new GraphBuilder<DateTimeData>(language)
			.name('time-duration')
			.skipPunctuation()
		)
			.add([ GraphBuilder.result(), unit ], v => addDurations(v[0], v[1]))
			.add([ GraphBuilder.result(), 'och', unit ], v => addDurations(v[0], v[1]))

			.build();
	}
};
