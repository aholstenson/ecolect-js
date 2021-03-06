import { mapDate } from '../src/dates';
import { TimeRelationship } from '../src/TimeRelationship';

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
		});
	});
});
