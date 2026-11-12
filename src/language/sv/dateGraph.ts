import { GraphBuilder } from '../../graph/index.js';
import type {
	DateTimeData,
	DateTimeOptions} from '../../type-datetime/index.js';
import {

	combine,
	isRelative,
	startOf,
	endOf,
	isWeek,
	isMonth,
	hasMonth,
	hasMonthAndDay,
	isPeriodWithParts,
	withPeriodPart,
	PeriodPart,
	weekend,
	nextWeekend,
	dayOfWeekAfterNext,
	isMonthWithoutWeek,
	withWeekOfMonth,
	LAST_WEEK_OF_MONTH,
	reverse,

	today,
	yesterday,
	dayBeforeYesterday,
	tomorrow,
	dayAfterTomorrow,
	nextDayOfWeek,
	previousDayOfWeek,
	LAST_DAY_OF_WEEK,
	numericDate,
	numericMonthDay,
	withDay,
	withYear,
	thisMonth,
	thisQuarter,
	thisWeek,
	thisYear
} from '../../type-datetime/index.js';
import { TimeRelationship } from '../../type-datetime/TimeRelationship.js';
import type { OrdinalData } from '../../type-numbers/index.js';
import type { LanguageGraphFactory } from '../index.js';

import { dateDurationGraph } from './dateDurationGraph.js';
import { dayOfWeekGraph } from './dayOfWeekGraph.js';
import { monthGraph } from './monthGraph.js';
import { MONTH_NAMES } from './monthNames.js';
import { ordinalGraph } from './ordinalGraph.js';
import { quarterGraph } from './quarterGraph.js';
import { weekGraph } from './weekGraph.js';
import { yearGraph } from './yearGraph.js';

/**
 * The ways of asking for the first day of a period.
 */
const START_OF = [
	'början av',
	'i början av',
	'början på',
	'första dagen av',
	'första dagen i'
];

/**
 * The ways of asking for the last day of a period.
 */
const END_OF = [
	'slutet av',
	'i slutet av',
	'slutet på',
	'sista dagen av',
	'sista dagen i'
];

/**
 * Set how a date relates to the current time, such as in the future for
 * `nästa mars`.
 *
 * @param date -
 *   the date
 * @param relation -
 *   how the date relates to the current time
 * @returns
 *   copy of the date with the relation set
 */
function withRelation(date: DateTimeData, relation: TimeRelationship): DateTimeData {
	return combine(date, { relationToCurrent: relation });
}

/**
 * The words before a month name that mean the next such month, the previous
 * such month and the month in the current year.
 */
const MONTH_RELATIONS: [ string, TimeRelationship ][] = [
	[ 'nästa', TimeRelationship.Future ],
	[ 'kommande', TimeRelationship.Future ],
	[ 'förra', TimeRelationship.Past ],
	[ 'föregående', TimeRelationship.Past ],
	[ 'denna', TimeRelationship.CurrentPeriod ]
];

export const dateGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'date',

	create(language) {
		const ordinal = language.graph(ordinalGraph);
		const dayOfWeek = language.graph(dayOfWeekGraph);
		const year = language.graph(yearGraph);
		const quarter = language.graph(quarterGraph);
		const week = language.graph(weekGraph);
		const month = language.graph(monthGraph);
		const dateDuration = language.graph(dateDurationGraph);

		const day = GraphBuilder.result(ordinal, (v: OrdinalData) => v.value >= 1 && v.value <= 31);

		/*
		 * Months by name only. A month written as a number, such as `3:e`,
		 * is not used after `nästa` and `förra`, as `förra 2` is not a month.
		 */
		const namedMonth = new GraphBuilder<DateTimeData>(language)
			.name('namedMonth')
			.map(MONTH_NAMES, l => ({ month: l }))
			.build();

		const twoDigitYear = /^[0-9]{2}$/;

		// A field in a numeric date, one or two digits or a four digit year
		const numericField = /^([0-9]{1,2}|[0-9]{4})$/;

		const builder = new GraphBuilder<DateTimeData>(language)
			.name('date')

			.skipPunctuation()

			// Relative
			.add([ dateDuration ], v => v[0])
			.add([ 'om', dateDuration ], v => v[0])
			.add([ dateDuration, 'efter', GraphBuilder.result() ], v => combine(v[0], {
				relativeTo: v[1]
			}))
			.add([ dateDuration, 'från', GraphBuilder.result() ], v => combine(v[0], {
				relativeTo: v[1]
			}))
			.add([ dateDuration, 'från nu' ], v => v[0])
			.add([ dateDuration, 'före', GraphBuilder.result() ], v => combine(reverse(v[0]), {
				relativeTo: v[1]
			}))
			.add([ GraphBuilder.result(), 'plus', dateDuration ], v => combine(v[1], {
				relativeTo: v[0]
			}))
			.add([ GraphBuilder.result(), '+', dateDuration ], v => combine(v[1], {
				relativeTo: v[0]
			}))
			.add([ GraphBuilder.result(), 'minus', dateDuration ], v => combine(reverse(v[1]), {
				relativeTo: v[0]
			}))
			.add([ GraphBuilder.result(), '-', dateDuration ], v => combine(reverse(v[1]), {
				relativeTo: v[0]
			}))

			// Denna söndag, nästa måndag or på tisdag
			.add(dayOfWeek, v => nextDayOfWeek(v[0]))
			.add([ 'denna', dayOfWeek ], v => nextDayOfWeek(v[0]))
			.add([ 'nästa', dayOfWeek ], v => nextDayOfWeek(v[0]))
			.add([ 'kommande', dayOfWeek ], v => nextDayOfWeek(v[0]))
			.add([ 'på', dayOfWeek ], v => nextDayOfWeek(v[0]))

			// Nästnästa fredag, a week after the next Friday
			.add([ 'nästnästa', dayOfWeek ], v => dayOfWeekAfterNext(v[0]))

			/*
			 * Weekends. Nästa helg follows the rule of nästa fredag, so it is
			 * the first weekend that starts after the current day.
			 */
			.add('helgen', () => weekend(0))
			.add('i helgen', () => weekend(0))
			.add('denna helg', () => weekend(0))
			.add('den här helgen', () => weekend(0))
			.add('veckoslutet', () => weekend(0))
			.add('nästa helg', () => nextWeekend())
			.add('kommande helg', () => nextWeekend())
			.add('nästnästa helg', () => nextWeekend(1))
			.add('förra helgen', () => weekend(-1))
			.add('föregående helg', () => weekend(-1))

			/*
			 * Parts of a period, such as mitten av januari, tidigt nästa
			 * vecka or sent 2027.
			 */
			.add([ 'tidigt', GraphBuilder.result(isPeriodWithParts) ], v => withPeriodPart(v[0], PeriodPart.Early))
			.add([ 'mitten av', GraphBuilder.result(isPeriodWithParts) ], v => withPeriodPart(v[0], PeriodPart.Mid))
			.add([ 'i mitten av', GraphBuilder.result(isPeriodWithParts) ], v => withPeriodPart(v[0], PeriodPart.Mid))
			.add([ 'mitten på', GraphBuilder.result(isPeriodWithParts) ], v => withPeriodPart(v[0], PeriodPart.Mid))
			.add([ 'sent', GraphBuilder.result(isPeriodWithParts) ], v => withPeriodPart(v[0], PeriodPart.Late))

			// Förra måndagen or föregående tisdag
			.add([ 'förra', dayOfWeek ], v => previousDayOfWeek(v[0]))
			.add([ 'föregående', dayOfWeek ], v => previousDayOfWeek(v[0]))
			.add([ 'i', dayOfWeek ], v => previousDayOfWeek(v[0]))

			// Expressions for describing the day, such as idag and imorgon
			.add('idag', today)
			.add('i dag', today)
			.add('imorgon', tomorrow)
			.add('i morgon', tomorrow)
			.add('imorron', tomorrow)
			.add('övermorgon', dayAfterTomorrow)
			.add('i övermorgon', dayAfterTomorrow)
			.add('igår', yesterday)
			.add('i går', yesterday)
			.add('förrgår', dayBeforeYesterday)
			.add('i förrgår', dayBeforeYesterday)

			// Day followed by month - 12 jan, 1 februari
			.add([ day, month ], v => withDay(v[1], v[0].value))
			.add([ day, 'i', month ], v => withDay(v[1], v[0].value))

			// Just the day
			.add([ day ], v => ({ day: v[0].value }))

			// Month followed by day - jan 12, februari 1
			.add([ month, day ], v => withDay(v[0], v[1].value))

			// Month
			.add([ month ], v => v[0])
			.add([ 'sista månaden', year ], v => combine(v[0], { month: 11 }))
			.add([ 'första månaden', year ], v => combine(v[0], { month: 0 }))

			// Non-year (month and day) followed by year
			// With day: 12 jan 2018, 1 februari 2018
			// Without day: jan 2018, denna månad 2018
			.add([ GraphBuilder.result(hasMonth), year ], v => combine(v[0], v[1]))

			/*
			 * Day and month followed by a two digit year, such as 5 jan -26
			 * or 5 jan '26.
			 */
			.add([ day, month, '-', twoDigitYear ], (v, e) => withYear(withDay(v[1], v[0].value), parseInt(v[2], 10), e))
			.add([ day, month, '\'', twoDigitYear ], (v, e) => withYear(withDay(v[1], v[0].value), parseInt(v[2], 10), e))

			.add([ month, 'i', /^[0-9]{1,2}$/ ], (v, e) => withYear(v[0], parseInt(v[1], 10), e))
			.add([ month, 'av', /^[0-9]{1,2}$/ ], (v, e) => withYear(v[0], parseInt(v[1], 10), e))

			/*
			 * Numeric dates with three fields, such as 2017-01-24 or
			 * 24/1/2017. The order of the fields is given by the dateOrder
			 * option, a four digit year at the start is always read as
			 * year, month and then day.
			 */
			.add([ numericField, '-', numericField, '-', numericField ], (v, e) => numericDate(
				parseInt(v[0], 10),
				parseInt(v[1], 10),
				parseInt(v[2], 10),
				e
			))

			// Numeric month and day, such as 1/24 or 24/1 depending on dateOrder
			.add([ /^[0-9]{1,2}$/, '/', /^[0-9]{1,2}$/ ], (v, e) => numericMonthDay(
				parseInt(v[0], 10),
				parseInt(v[1], 10),
				e
			))

			// Standalone year
			.add([ year ], v => v[0])

			// Quarters
			.add(quarter, v => v[0])

			// Quarter N of year
			.add([ quarter, year ], v => combine(v[1], {
				quarter: v[0].quarter
			}))

			.add([ year, quarter ], v => combine(v[0], {
				quarter: v[1].quarter
			}))

			// Weeks relative to current time
			.add(week, v => v[0])

			// Week N of year
			.add([ week, year ], v => combine(v[1], {
				week: v[0].week
			}))

			.add([ year, week ], v => combine(v[0], {
				week: v[1].week
			}))

			/*
			 * A week counted in a month, such as andra veckan i januari or
			 * sista veckan i juni. The weeks are calendar weeks.
			 */
			.add([ ordinal, 'veckan', GraphBuilder.result(isMonthWithoutWeek) ], v => withWeekOfMonth(v[1], v[0].value))
			.add([ 'sista veckan', GraphBuilder.result(isMonthWithoutWeek) ], v => withWeekOfMonth(v[0], LAST_WEEK_OF_MONTH))
			.add([ ordinal, 'veckan i månaden' ], (v, e) => withWeekOfMonth(thisMonth(v, e), v[0].value))
			.add('sista veckan i månaden', (v, e) => withWeekOfMonth(thisMonth(v, e), LAST_WEEK_OF_MONTH))

			// nth day of week in month
			.add([ ordinal, dayOfWeek, GraphBuilder.result(isMonth) ], v => combine(v[2], {
				dayOfWeek: v[1],
				dayOfWeekOrdinal: v[0].value
			}))

			// first day of week in month
			.add([ dayOfWeek, GraphBuilder.result(isMonth) ], v => combine(v[1], {
				dayOfWeek: v[0],
				dayOfWeekOrdinal: 1
			}))

			// last day of week in month
			.add([ 'sista', dayOfWeek, GraphBuilder.result(isMonth) ], v => combine(v[1], {
				dayOfWeek: v[0],
				dayOfWeekOrdinal: LAST_DAY_OF_WEEK
			}))

			// nth day of week in year
			.add([ ordinal, dayOfWeek, year ], v => combine(v[2], {
				dayOfWeek: v[1],
				dayOfWeekOrdinal: v[0].value
			}))

			// first day of week in year
			.add([ dayOfWeek, year ], v => combine(v[1], {
				dayOfWeek: v[0],
				dayOfWeekOrdinal: 1
			}))

			// last day of week in year
			.add([ 'sista', dayOfWeek, year ], v => combine(v[1], {
				dayOfWeek: v[0],
				dayOfWeekOrdinal: LAST_DAY_OF_WEEK
			}))

			// nth day of week in X time
			.add([ ordinal, dayOfWeek, GraphBuilder.result(isRelative) ], v => combine(v[2], {
				dayOfWeek: v[1],
				dayOfWeekOrdinal: v[0].value
			}))

			// first day of week in X time
			.add([ dayOfWeek, GraphBuilder.result(isRelative) ], v => combine(v[1], {
				dayOfWeek: v[0],
				dayOfWeekOrdinal: 1
			}))

			// last day of week in X time
			.add([ 'sista', dayOfWeek, GraphBuilder.result(isRelative) ], v => combine(v[1], {
				dayOfWeek: v[0],
				dayOfWeekOrdinal: LAST_DAY_OF_WEEK
			}))

			/*
			 * A day of the week before a day in a month, such as torsdag 12
			 * november or torsdagen den 12 november. The month and the day
			 * give the date, so the day of the week is not used.
			 */
			.add([ dayOfWeek, GraphBuilder.result(hasMonthAndDay) ], v => v[1])
			.add([ dayOfWeek, 'den', GraphBuilder.result(hasMonthAndDay) ], v => v[1])

			// day of week in week X
			.add([ dayOfWeek, GraphBuilder.result(isWeek) ], v => combine(v[1], {
				dayOfWeek: v[0],
				dayOfWeekOrdinal: 1
			}))

			.add([ GraphBuilder.result(isWeek), dayOfWeek ], v => combine(v[0], {
				dayOfWeek: v[1],
				dayOfWeekOrdinal: 1
			}))

			// Extra qualifiers such as i and på
			.add([ 'i', GraphBuilder.result(isRelative) ], v => v[0])
			.add([ 'på', GraphBuilder.result() ], v => v[0])
			.add([ 'den', GraphBuilder.result() ], v => v[0])
			.add([ dateDuration, 'sedan' ], v => reverse(v[0]))
			.add([ 'för', dateDuration, 'sedan' ], v => reverse(v[0]));

		/*
		 * A named month relative to the current one. `nästa mars` and `förra
		 * mars` are never the current month, `denna mars` is the month in the
		 * current year.
		 */
		for(const [ word, relation ] of MONTH_RELATIONS) {
			builder.add([ word, namedMonth ], v => withRelation(v[0], relation));
			builder.add([ word, namedMonth, day ], v => withRelation(withDay(v[0], v[1].value), relation));
			builder.add([ day, word, namedMonth ], v => withRelation(withDay(v[1], v[0].value), relation));
		}

		// Edges, such as början av [date] or slutet av [date]
		for(const prefix of START_OF) {
			builder.add([ prefix, GraphBuilder.result() ], v => startOf(v[0]));
		}

		for(const prefix of END_OF) {
			builder.add([ prefix, GraphBuilder.result() ], v => endOf(v[0]));
		}

		/*
		 * Edges of the current period, such as slutet av månaden or första
		 * dagen av året. The periods are named in their definite form, as
		 * Swedish does when nothing else says which one is meant.
		 */
		const currentPeriods: [ string, (v: any, e: DateTimeOptions) => DateTimeData ][] = [
			[ 'veckan', thisWeek ],
			[ 'månaden', thisMonth ],
			[ 'kvartalet', thisQuarter ],
			[ 'året', thisYear ]
		];

		// The parts of the current period, such as mitten av månaden
		for(const [ noun, current ] of currentPeriods) {
			builder
				.add('tidigt i ' + noun, (v, e) => withPeriodPart(current(v, e), PeriodPart.Early))
				.add('mitten av ' + noun, (v, e) => withPeriodPart(current(v, e), PeriodPart.Mid))
				.add('i mitten av ' + noun, (v, e) => withPeriodPart(current(v, e), PeriodPart.Mid))
				.add('mitten på ' + noun, (v, e) => withPeriodPart(current(v, e), PeriodPart.Mid))
				.add('sent i ' + noun, (v, e) => withPeriodPart(current(v, e), PeriodPart.Late));
		}

		for(const [ noun, current ] of currentPeriods) {
			for(const prefix of START_OF) {
				builder.add(prefix + ' ' + noun, (v, e) => startOf(current(v, e)));
			}

			for(const prefix of END_OF) {
				builder.add(prefix + ' ' + noun, (v, e) => endOf(current(v, e)));
			}
		}

		return builder.build();
	}
};
