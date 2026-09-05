import { mapDate, LAST_DAY_OF_WEEK } from '../src/dates.js';
import { TimeRelationship } from '../src/TimeRelationship.js';

describe('Time', () => {
	describe('dates', () => {

		describe('mapDate', () => {
			const options = {
				now: new Date(2017, 2, 24)
			};

			it('relativeYears keeps month and day', () => {
				const r = mapDate({ relativeYears: 0 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 3,
					dayOfMonth: 24
				});
			});

			it('relativeYears works with positive years', () => {
				const r = mapDate({ relativeYears: 2 }, options);

				expect(r).toEqual({
					year: 2019,
					month: 3,
					dayOfMonth: 24
				});
			});

			it('relativeYears works with negative years', () => {
				const r = mapDate({ relativeYears: -2 }, options);

				expect(r).toEqual({
					year: 2015,
					month: 3,
					dayOfMonth: 24
				});
			});

			it('year resets month and day', () => {
				const r = mapDate({ year: 2018 }, options);

				expect(r).toEqual({
					year: 2018,
					month: 1,
					dayOfMonth: 1
				});
			});

			it('relativeQuarters keeps day', () => {
				const r = mapDate({ relativeQuarters: 0 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 3,
					dayOfMonth: 24
				});
			});

			it('relativeQuarters changes quarter', () => {
				const r = mapDate({ relativeQuarters: 1 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 6,
					dayOfMonth: 24
				});
			});

			it('quarter after current keeps year', () => {
				const r = mapDate({ quarter: 3 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 7,
					dayOfMonth: 1
				});
			});

			it('quarter before current changes year', () => {
				const r = mapDate({ quarter: 1 }, { now: new Date(2017, 4, 24) });

				expect(r).toEqual({
					year: 2018,
					month: 1,
					dayOfMonth: 1
				});
			});

			it('relativeWeeks keeps day', () => {
				const r = mapDate({ relativeWeeks: 0 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 3,
					dayOfMonth: 24
				});
			});

			it('relativeWeeks changes week', () => {
				const r = mapDate({ relativeWeeks: 2 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 4,
					dayOfMonth: 7
				});
			});

			it('week after current week keeps year', () => {
				const r = mapDate({ week: 13 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 3,
					dayOfMonth: 26
				});
			});

			it('week before current week is next year', () => {
				const r = mapDate({ week: 11 }, options);

				expect(r).toEqual({
					year: 2018,
					month: 3,
					dayOfMonth: 11
				});
			});

			it('week before current week with past=true keeps year', () => {
				const r = mapDate({ week: 11, relationToCurrent: TimeRelationship.Past }, options);

				expect(r).toEqual({
					year: 2017,
					month: 3,
					dayOfMonth: 12
				});
			});

			it('relativeMonths keeps day', () => {
				const r = mapDate({ relativeMonths: 2 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 5,
					dayOfMonth: 24
				});
			});

			it('month after current month is same year', () => {
				const r = mapDate({ month: 4 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 5,
					dayOfMonth: 1
				});
			});

			it('month before current month is next year', () => {
				const r = mapDate({ month: 1 }, options);

				expect(r).toEqual({
					year: 2018,
					month: 2,
					dayOfMonth: 1
				});
			});

			it('month before current month with past=true is same year', () => {
				const r = mapDate({ month: 1, relationToCurrent: TimeRelationship.Past }, options);

				expect(r).toEqual({
					year: 2017,
					month: 2,
					dayOfMonth: 1
				});
			});

			it('month before current month with year', () => {
				const r = mapDate({ month: 1, year: 2017 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 2,
					dayOfMonth: 1
				});
			});

			it('month after current month with year', () => {
				const r = mapDate({ month: 6, year: 2017 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 7,
					dayOfMonth: 1
				});
			});

			it('day after the current day is same month', () => {
				const r = mapDate({ day: 28 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 3,
					dayOfMonth: 28
				});
			});

			it('day before the current day is next month', () => {
				const r = mapDate({ day: 2 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 4,
					dayOfMonth: 2
				});
			});

			it('relativeYears and relativeMonths keeps day', () => {
				const r = mapDate({ relativeYears: 1, relativeMonths: 2 }, options);

				expect(r).toEqual({
					year: 2018,
					month: 5,
					dayOfMonth: 24
				});
			});

			it('relativeYears, relativeMonths and relativeDays', () => {
				const r = mapDate({ relativeYears: 1, relativeMonths: 2 }, options);

				expect(r).toEqual({
					year: 2018,
					month: 5,
					dayOfMonth: 24
				});
			});

			it('year, month and day', () => {
				const r = mapDate({ year: 2019, month: 1, day: 2 }, options);

				expect(r).toEqual({
					year: 2019,
					month: 2,
					dayOfMonth: 2
				});
			});

			it('relativeQuarters works with negative quarters', () => {
				const r = mapDate({ relativeQuarters: -1 }, options);

				expect(r).toEqual({
					year: 2016,
					month: 12,
					dayOfMonth: 24
				});
			});

			it('relativeTo keeps its own relation to the current time', () => {
				// The day after the previous Friday, current time is a Friday
				const r = mapDate({
					relativeDays: 1,
					relativeTo: { dayOfWeek: 5, relationToCurrent: TimeRelationship.Past }
				}, options);

				expect(r).toEqual({
					year: 2017,
					month: 3,
					dayOfMonth: 18
				});
			});
		});

		describe('mapDate validation', () => {
			const options = {
				now: new Date(2017, 2, 24)
			};

			it('month outside 0-11 is null', () => {
				expect(mapDate({ month: -1 }, options)).toBeNull();
				expect(mapDate({ month: 12 }, options)).toBeNull();
			});

			it('day outside 1-31 is null', () => {
				expect(mapDate({ day: 0 }, options)).toBeNull();
				expect(mapDate({ day: 32 }, options)).toBeNull();
			});

			it('quarter outside 1-4 is null', () => {
				expect(mapDate({ quarter: 0 }, options)).toBeNull();
				expect(mapDate({ quarter: 5 }, options)).toBeNull();
			});

			it('week outside 1-53 is null', () => {
				expect(mapDate({ week: 0 }, options)).toBeNull();
				expect(mapDate({ week: 54 }, options)).toBeNull();
			});

			it('week 53 in a year with 52 weeks is null', () => {
				const iso = { ...options, weekStartsOn: 1 as const, firstWeekContainsDate: 4 as const };

				expect(mapDate({ year: 2017, week: 53 }, iso)).toBeNull();
			});

			it('day that does not exist in a specific month and year is null', () => {
				expect(mapDate({ year: 2017, month: 1, day: 29 }, options)).toBeNull();
				expect(mapDate({ year: 2018, month: 3, day: 31 }, options)).toBeNull();
			});
		});

		describe('mapDate day overflow', () => {
			const options = {
				now: new Date(2017, 1, 10)
			};

			it('day moves to the next month that has it', () => {
				const r = mapDate({ day: 31 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 3,
					dayOfMonth: 31
				});
			});

			it('day moves to the previous month that has it with past relation', () => {
				const r = mapDate({ day: 31, relationToCurrent: TimeRelationship.Past }, options);

				expect(r).toEqual({
					year: 2017,
					month: 1,
					dayOfMonth: 31
				});
			});

			it('February 29th moves to the next leap year', () => {
				const r = mapDate({ month: 1, day: 29 }, options);

				expect(r).toEqual({
					year: 2020,
					month: 2,
					dayOfMonth: 29
				});
			});

			it('February 29th moves to the previous leap year with past relation', () => {
				const r = mapDate({ month: 1, day: 29, relationToCurrent: TimeRelationship.Past }, options);

				expect(r).toEqual({
					year: 2016,
					month: 2,
					dayOfMonth: 29
				});
			});
		});

		describe('mapDate weeks', () => {
			const iso = {
				now: new Date(2017, 0, 24),
				weekStartsOn: 1 as const,
				firstWeekContainsDate: 4 as const
			};

			it('week of a specific year uses the week numbering year', () => {
				// January 1st 2017 is a Sunday in week 52 of 2016
				const r = mapDate({ year: 2017, week: 1 }, iso);

				expect(r).toEqual({
					year: 2017,
					month: 1,
					dayOfMonth: 2
				});
			});

			it('week of a specific year with weeks starting on Sunday', () => {
				const r = mapDate({ year: 2017, week: 1 }, { now: iso.now });

				expect(r).toEqual({
					year: 2017,
					month: 1,
					dayOfMonth: 1
				});
			});

			it('week 53 of a year with 53 weeks', () => {
				const r = mapDate({ year: 2020, week: 53 }, iso);

				expect(r).toEqual({
					year: 2020,
					month: 12,
					dayOfMonth: 28
				});
			});

			it('day of week within a specific week', () => {
				const r = mapDate({ year: 2017, week: 5, dayOfWeek: 1 }, iso);

				expect(r).toEqual({
					year: 2017,
					month: 1,
					dayOfMonth: 30
				});
			});

			it('Sunday within a week starting on Monday is the last day', () => {
				const r = mapDate({ year: 2017, week: 5, dayOfWeek: 0 }, iso);

				expect(r).toEqual({
					year: 2017,
					month: 2,
					dayOfMonth: 5
				});
			});
		});

		describe('mapDate day of week', () => {
			// A Tuesday
			const options = {
				now: new Date(2017, 0, 24)
			};

			it('next occurrence of a later day', () => {
				const r = mapDate({ dayOfWeek: 5 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 1,
					dayOfMonth: 27
				});
			});

			it('next occurrence of the current day is a week away', () => {
				const r = mapDate({ dayOfWeek: 2 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 1,
					dayOfMonth: 31
				});
			});

			it('previous occurrence of an earlier day', () => {
				const r = mapDate({ dayOfWeek: 1, relationToCurrent: TimeRelationship.Past }, options);

				expect(r).toEqual({
					year: 2017,
					month: 1,
					dayOfMonth: 23
				});
			});

			it('previous occurrence of the current day is a week back', () => {
				const r = mapDate({ dayOfWeek: 2, relationToCurrent: TimeRelationship.Past }, options);

				expect(r).toEqual({
					year: 2017,
					month: 1,
					dayOfMonth: 17
				});
			});

			it('first day of week in a month starting on that day', () => {
				// May 1st 2015 is a Friday
				const r = mapDate({ year: 2015, month: 4, dayOfWeek: 5, dayOfWeekOrdinal: 1 }, options);

				expect(r).toEqual({
					year: 2015,
					month: 5,
					dayOfMonth: 1
				});
			});

			it('first day of week in a year starting on that day', () => {
				// January 1st 2016 is a Friday
				const r = mapDate({ year: 2016, dayOfWeek: 5, dayOfWeekOrdinal: 1 }, options);

				expect(r).toEqual({
					year: 2016,
					month: 1,
					dayOfMonth: 1
				});
			});

			it('third day of week in a month', () => {
				const r = mapDate({ year: 2017, month: 0, dayOfWeek: 5, dayOfWeekOrdinal: 3 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 1,
					dayOfMonth: 20
				});
			});

			it('last day of week in a month', () => {
				const r = mapDate({ year: 2017, month: 0, dayOfWeek: 5, dayOfWeekOrdinal: LAST_DAY_OF_WEEK }, options);

				expect(r).toEqual({
					year: 2017,
					month: 1,
					dayOfMonth: 27
				});
			});

			it('last day of week in a year', () => {
				const r = mapDate({ year: 2018, dayOfWeek: 1, dayOfWeekOrdinal: LAST_DAY_OF_WEEK }, options);

				expect(r).toEqual({
					year: 2018,
					month: 12,
					dayOfMonth: 31
				});
			});

			it('ordinal beyond the month is null', () => {
				// January 2017 has four Fridays
				const r = mapDate({ year: 2017, month: 0, dayOfWeek: 5, dayOfWeekOrdinal: 5 }, options);

				expect(r).toBeNull();
			});

			it('first day of week from a relative time counts the day itself', () => {
				// Two weeks ahead is also a Tuesday
				const r = mapDate({ relativeWeeks: 2, dayOfWeek: 2, dayOfWeekOrdinal: 1 }, options);

				expect(r).toEqual({
					year: 2017,
					month: 2,
					dayOfMonth: 7
				});
			});
		});
	});
});
