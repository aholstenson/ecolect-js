import { GraphBuilder } from '@ecolect/graph';
import { LanguageGraphFactory } from '@ecolect/language';
import {
	DateTimeData,
	DateTimeOptions,

	combine,
	isRelative,
	startOf,
	endOf,
	isWeek,
	isMonth,
	hasMonth,
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
} from '@ecolect/type-datetime';
import { OrdinalData } from '@ecolect/type-numbers';

import { dateDurationGraph } from './dateDurationGraph.js';
import { dayOfWeekGraph } from './dayOfWeekGraph.js';
import { monthGraph } from './monthGraph.js';
import { ordinalGraph } from './ordinalGraph.js';
import { quarterGraph } from './quarterGraph.js';
import { weekGraph } from './weekGraph.js';
import { yearGraph } from './yearGraph.js';

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

		// A field in a numeric date, one or two digits or a four digit year
		const numericField = /^([0-9]{1,2}|[0-9]{4})$/;

		const builder = new GraphBuilder<DateTimeData>(language)
			.name('date')

			.skipPunctuation()

			// Relative
			.add([ dateDuration ], v => v[0])
			.add([ dateDuration, 'after', GraphBuilder.result() ], v => combine(v[0], {
				relativeTo: v[1]
			}))
			.add([ dateDuration, 'from', GraphBuilder.result() ], v => combine(v[0], {
				relativeTo: v[1]
			}))
			.add([ dateDuration, 'from now' ], v => v[0])
			.add([ dateDuration, 'before', GraphBuilder.result() ], v => combine(reverse(v[0]), {
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

			// This Sunday, Next Monday or On Tuesday
			.add(dayOfWeek, v => nextDayOfWeek(v[0]))
			.add([ 'this', dayOfWeek ], v => nextDayOfWeek(v[0]))
			.add([ 'next', dayOfWeek ], v => nextDayOfWeek(v[0]))
			.add([ 'on', dayOfWeek ], v => nextDayOfWeek(v[0]))

			// Last Monday or Previous Tuesday
			.add([ 'last', dayOfWeek ], v => previousDayOfWeek(v[0]))
			.add([ 'previous', dayOfWeek ], v => previousDayOfWeek(v[0]))

			// Expressions for describing the day, such as today and tomorrow
			.add('today', today)
			.add('tomorrow', tomorrow)
			.add('day after tomorrow', dayAfterTomorrow)
			.add('the day after tomorrow', dayAfterTomorrow)
			.add('yesterday', yesterday)
			.add('day before yesterday', dayBeforeYesterday)
			.add('the day before yesterday', dayBeforeYesterday)

			// Month followed by day - Jan 12, February 1st
			.add([ month, day ], v => withDay(v[0], v[1].value))

			// Just the day
			.add([ day ], v => ({ day: v[0].value }))

			// Day followed by month - 12 Jan, 1st February
			.add([ day, month ], v => withDay(v[1], v[0].value))
			.add([ day, 'of', month ], v => withDay(v[1], v[0].value))

			// Month
			.add([ month ], v => v[0])
			.add([ 'last month', year ], v => combine(v[0], { month: 11 }))
			.add([ 'first month', year ], v => combine(v[0], { month: 0 }))

			// Non-year (month and day) followed by year
			// With day: 12 Jan 2018, 1st February 2018
			// Without day: Jan 2018, this month 2018
			.add([ GraphBuilder.result(hasMonth), year ], v => combine(v[0], v[1]))

			.add([ month, 'in', /^[0-9]{1,2}$/ ], (v, e) => withYear(v[0], parseInt(v[1], 10), e))
			.add([ month, 'of', /^[0-9]{1,2}$/ ], (v, e) => withYear(v[0], parseInt(v[1], 10), e))

			/*
			 * Numeric dates with three fields, such as 2017-01-24, 1/24/2017
			 * or 1/24/17. The order of the fields is given by the dateOrder
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
			.add([ 'last', dayOfWeek, GraphBuilder.result(isMonth) ], v => combine(v[1], {
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
			.add([ 'last', dayOfWeek, year ], v => combine(v[1], {
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
			.add([ 'last', dayOfWeek, GraphBuilder.result(isRelative) ], v => combine(v[1], {
				dayOfWeek: v[0],
				dayOfWeekOrdinal: LAST_DAY_OF_WEEK
			}))

			// day of week in week X
			.add([ dayOfWeek, GraphBuilder.result(isWeek) ], v => combine(v[1], {
				dayOfWeek: v[0],
				dayOfWeekOrdinal: 1
			}))

			.add([ GraphBuilder.result(isWeek), dayOfWeek ], v => combine(v[0], {
				dayOfWeek: v[1],
				dayOfWeekOrdinal: 1
			}))

			// Extra qualifiers such as in and on
			.add([ 'in', GraphBuilder.result(isRelative) ], v => v[0])
			.add([ 'on', GraphBuilder.result() ], v => v[0])
			.add([ 'on', 'the', GraphBuilder.result() ], v => v[0])
			.add([ dateDuration, 'ago' ], v => reverse(v[0]))

			// Edges, such as start of [date] or end of [date]
			.add([ 'start of', GraphBuilder.result() ], v => startOf(v[0]))
			.add([ 'beginning of', GraphBuilder.result() ], v => startOf(v[0]))
			.add([ 'first day of', GraphBuilder.result() ], v => startOf(v[0]))
			.add([ 'end of', GraphBuilder.result() ], v => endOf(v[0]))
			.add([ 'last day of', GraphBuilder.result() ], v => endOf(v[0]));

		/*
		 * Edges of the current period, such as end of month or last day of
		 * the year.
		 */
		const currentPeriods: [ string, (v: any, e: DateTimeOptions) => DateTimeData ][] = [
			[ 'week', thisWeek ],
			[ 'month', thisMonth ],
			[ 'quarter', thisQuarter ],
			[ 'year', thisYear ]
		];

		for(const [ name, current ] of currentPeriods) {
			for(const noun of [ name, 'the ' + name ]) {
				builder
					.add('start of ' + noun, (v, e) => startOf(current(v, e)))
					.add('beginning of ' + noun, (v, e) => startOf(current(v, e)))
					.add('first day of ' + noun, (v, e) => startOf(current(v, e)))
					.add('end of ' + noun, (v, e) => endOf(current(v, e)))
					.add('last day of ' + noun, (v, e) => endOf(current(v, e)));
			}
		}

		return builder.build();
	}
};
