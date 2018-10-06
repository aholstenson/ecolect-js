'use strict';

const chai = require('chai');
const expect = chai.expect;

const { map } = require('../../time/dates');

describe('Time', () => {
	describe('dates', () => {

		describe('map', () => {
			const e = {
				options: {
					now: new Date(2017, 2, 24)
				}
			};

			it('relativeYears keeps month and day', () => {
				const r = map({ relativeYears: 0 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2017,
					month: 2,
					day: 24
				});
			});

			it('relativeYears works with positive years', () => {
				const r = map({ relativeYears: 2 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2019,
					month: 2,
					day: 24
				});
			});

			it('relativeYears works with negative years', () => {
				const r = map({ relativeYears: -2 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2015,
					month: 2,
					day: 24
				});
			});

			it('year resets month and day', () => {
				const r = map({ year: 2018 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2018,
					month: 0,
					day: 1
				});
			});

			it('relativeQuarters keeps day', () => {
				const r = map({ relativeQuarters: 0 }, e);

				expect(r).to.deep.equal({
					period: 'quarter',
					year: 2017,
					month: 2,
					day: 24
				});
			});

			it('relativeQuarters changes quarter', () => {
				const r = map({ relativeQuarters: 1 }, e);

				expect(r).to.deep.equal({
					period: 'quarter',
					year: 2017,
					month: 5,
					day: 24
				});
			});

			it('quarter after current keeps year', () => {
				const r = map({ quarter: 3 }, e);

				expect(r).to.deep.equal({
					period: 'quarter',
					year: 2017,
					month: 6,
					day: 1
				});
			});

			it('quarter before current changes year', () => {
				const r = map({ quarter: 1 }, { options: {
					now: new Date(2017, 4, 24)
				}});

				expect(r).to.deep.equal({
					period: 'quarter',
					year: 2018,
					month: 0,
					day: 1
				});
			});

			it('relativeWeeks keeps day', () => {
				const r = map({ relativeWeeks: 0 }, e);

				expect(r).to.deep.equal({
					period: 'week',
					year: 2017,
					month: 2,
					day: 24
				});
			});

			it('relativeWeeks changes week', () => {
				const r = map({ relativeWeeks: 2 }, e);

				expect(r).to.deep.equal({
					period: 'week',
					year: 2017,
					month: 3,
					day: 7
				});
			});

			it('week after current week keeps year', () => {
				const r = map({ week: 13 }, e);

				expect(r).to.deep.equal({
					period: 'week',
					year: 2017,
					month: 2,
					day: 26
				});
			});

			it('week before current week is next year', () => {
				const r = map({ week: 11}, e);

				expect(r).to.deep.equal({
					period: 'week',
					year: 2018,
					month: 2,
					day: 11
				});
			});

			it('week before current week with past=true keeps year', () => {
				const r = map({ week: 11, relationToCurrent: 'past' }, e);

				expect(r).to.deep.equal({
					period: 'week',
					year: 2017,
					month: 2,
					day: 12
				});
			});

			it('relativeMonths keeps day', () => {
				const r = map({ relativeMonths: 2 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 4,
					day: 24
				});
			});

			it('month after current month is same year', () => {
				const r = map({ month: 4 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 4,
					day: 1
				});
			});

			it('month before current month is next year', () => {
				const r = map({ month: 1 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2018,
					month: 1,
					day: 1
				});
			});

			it('month before current month with past=true is same year', () => {
				const r = map({ month: 1, relationToCurrent: 'past' }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 1,
					day: 1
				});
			});

			it('month before current month with year', () => {
				const r = map({ month: 1, year: 2017 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 1,
					day: 1
				});
			});

			it('month after current month with year', () => {
				const r = map({ month: 6, year: 2017 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 6,
					day: 1
				});
			});

			it('day after the current day is same month', () => {
				const r = map({ day: 28 }, e);

				expect(r).to.deep.equal({
					period: 'day',
					year: 2017,
					month: 2,
					day: 28
				});
			});

			it('day before the current day is next month', () => {
				const r = map({ day: 2 }, e);

				expect(r).to.deep.equal({
					period: 'day',
					year: 2017,
					month: 3,
					day: 2
				});
			});

			it('relativeYears and relativeMonths keeps day', () => {
				const r = map({ relativeYears: 1, relativeMonths: 2 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2018,
					month: 4,
					day: 24
				});
			});

			it('relativeYears, relativeMonths and relativeDays', () => {
				const r = map({ relativeYears: 1, relativeMonths: 2 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2018,
					month: 4,
					day: 24
				});
			});

			it('year, month and day', () => {
				const r = map({ year: 2019, month: 1, day: 2 }, e);

				expect(r).to.deep.equal({
					period: 'day',
					year: 2019,
					month: 1,
					day: 2
				});
			});
		});
	});
});
