import { GraphBuilder } from '../../graph/builder';
import { ValueMatcherFactory } from '../value-matcher-factory';
import { DateValue } from '../../time/date-value';

import {
	combine,
	isRelative,
	startOf,
	endOf,
	isWeek,
	isMonth,
	hasMonth,
	reverse
} from '../../time/matching';

import { IntervalEdge } from '../../time/edge';
import { DateTimeData } from '../../time/date-time-data';
import { thisWeek } from '../../time/weeks';
import { thisQuarter } from '../../time/quarters';
import { map, today, yesterday, tomorrow, dayAfterTomorrow, nextDayOfWeek, withDay, withYear } from '../../time/dates';

import { OrdinalValue } from '../../numbers/ordinal-value';

import { ordinalMatcher } from './ordinal';
import { dayOfWeekMatcher } from './day-of-week';
import { yearMatcher } from './year';
import { quarterMatcher } from './quarter';
import { weekMatcher } from './week';
import { monthMatcher } from './month';
import { dateDurationMatcher } from './date-duration';

export const dateMatcher: ValueMatcherFactory<DateValue> = {
	id: 'date',

	create(language) {
		const ordinal = language.matcher(ordinalMatcher);
		const dayOfWeek = language.matcher(dayOfWeekMatcher);
		const year = language.matcher(yearMatcher);
		const quarter = language.matcher(quarterMatcher);
		const week = language.matcher(weekMatcher);
		const month = language.matcher(monthMatcher);
		const dateDuration = language.matcher(dateDurationMatcher);

		const day = GraphBuilder.result(ordinal, (v: OrdinalValue) => v.value >= 0 && v.value < 31);

		return new GraphBuilder<DateTimeData>(language)
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

			// Expressions for describing the day, such as today and tomorrow
			.add('today', today)
			.add('tomorrow', tomorrow)
			.add('day after tomorrow', dayAfterTomorrow)
			.add('the day after tomorrow', dayAfterTomorrow)
			.add('yesterday', yesterday)

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

			.add([ month, 'in', /^[0-9]{1,2}$/ ], v => withYear(v[0], parseInt(v[1], 10)))
			.add([ month, 'of', /^[0-9]{1,2}$/ ], v => withYear(v[0], parseInt(v[1], 10)))

			// Year - Month - Day, such as 2017-01-24 or 2017 2 5
			.add([ /^[0-9]{4}$/, '-', /^[0-9]{1,2}$/, '-', /^[0-9]{1,2}$/ ], v => {
				return {
					year: parseInt(v[0], 10),
					month: parseInt(v[1], 10) - 1,
					day: parseInt(v[2], 10)
				};
			})

			// Month / Day / Year
			.add([ /^[0-9]{1,2}$/, '/', /^[0-9]{1,2}$/, '/', /^[0-9]{4}$/ ], v => {
				return {
					year: parseInt(v[2], 10),
					month: parseInt(v[0], 10) - 1,
					day: parseInt(v[1], 10)
				};
			})

			// Month / Day
			.add([ /^[0-9]{1,2}$/, '/', /^[0-9]{1,2}$/ ], v => {
				return {
					month: parseInt(v[0], 10) - 1,
					day: parseInt(v[1], 10)
				};
			})

			// Standalone year
			.add([ year ], v => v[0])

			// Quarters
			.add(quarter, v => v[0])
			.add('start of quarter', thisQuarter)
			.add('end of quarter', (v, e) => combine(thisQuarter(v, e), { intervalEdge: IntervalEdge.End }))

			// Quarter N of year
			.add([ quarter, year ], v => combine(v[1], {
				quarter: v[0].quarter
			}))

			.add([ year, quarter ], v => combine(v[0], {
				quarter: v[1].quarter
			}))

			// Weeks relative to current time
			.add(week, v => v[0])
			.add('start of week', thisWeek)
			.add('end of week', (v, e) => combine(thisWeek(v, e), { intervalEdge: IntervalEdge.End }))

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
			.add([ 'end of', GraphBuilder.result() ], v => endOf(v[0]))

			.mapResults(map)
			.onlyBest()
			.toMatcher();
	}
};
