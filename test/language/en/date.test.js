'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../../../language/en');
const date = (text, options) => en.date.match(text, options);

describe('English', function() {
	describe('Date', function() {
		describe('Weekdays', function() {
			it('this tuesday', function() {
				const now = new Date(2017, 0, 24);
				return date('this tuesday', { now: now })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2017,
							month: 0,
							day: 31
						})
					);
			});

			it('this Fri', function() {
				const now = new Date(2017, 0, 24);
				return date('this Fri', { now: now })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2017,
							month: 0,
							day: 27
						})
					);
			});

			it('this Monday', function() {
				const now = new Date(2017, 0, 24);
				return date('this Monday', { now: now })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2017,
							month: 0,
							day: 30
						})
					);
			});

			it('on Monday', function() {
				const now = new Date(2017, 0, 24);
				return date('on Monday', { now: now })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2017,
							month: 0,
							day: 30
						})
					);
			});
		});

		describe('Day', function() {
			it('12th', function() {
				const now = new Date(2017, 0, 24);
				return date('12th', { now: now })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2017,
							month: 1,
							day: 12
						})
					);
			});

			it('12', function() {
				const now = new Date(2017, 0, 24);
				return date('12', { now: now })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2017,
							month: 1,
							day: 12
						})
					);
			});

			it('32nd', function() {
				const now = new Date(2017, 0, 24);
				return date('32nd', { now: now })
					.then(v =>
						expect(v).to.deep.equal(null)
					);
			});
		});

		describe('Month + day', function() {
			it('jan 12', function() {
				const now = new Date(2017, 0, 24);
				return date('jan 12', { now: now })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2017,
							month: 0,
							day: 12
						})
					);
			});

			it('12 jan', function() {
				const now = new Date(2017, 0, 24);
				return date('12 jan', { now: now })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2017,
							month: 0,
							day: 12
						})
					);
			});

			it('12th november', function() {
				const now = new Date(2017, 0, 24);
				return date('12th november', { now: now })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2017,
							month: 10,
							day: 12
						})
					);
			});

			it('12th of november', function() {
				const now = new Date(2017, 0, 24);
				return date('12th of november', { now: now })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2017,
							month: 10,
							day: 12
						})
					);
			});

			it('4/12', function() {
				const now = new Date(2017, 0, 24);
				return date('4/12', { now: now })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2017,
							month: 3,
							day: 12
						})
					);
			});
		});

		describe('Year', function() {
			it('2018', function() {
				const now = new Date(2017, 0, 24);
				return date('2018', { now: now })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'year',
							year: 2018,
							month: 0,
							day: 1
						})
					);
			});

			it('this year', function() {
				const now = new Date(2017, 0, 24);
				return date('this year', { now: now })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'year',
							year: 2017,
							month: 0,
							day: 1
						})
					);
			});
		});

		describe('Relative day of week in month', function() {
			it('first Friday May', function() {
				return date('first Friday May', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 4,
							day: 7
						})
					);
			});

			it('first Friday in May', function() {
				return date('first Friday in May', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 4,
							day: 7
						})
					);
			});

			it('3rd Friday in May', function() {
				return date('3rd Friday in May', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 4,
							day: 21
						})
					);
			});
		});

		// TODO: This is range, move to range tests when implemented
		/*
		describe('Month + Year', function() {
			it('may 2018', function() {
				return date('may 2018')
					.then(v =>
						expect(v).to.deep.equal({
							year: 2018,
							month: 4
						})
					);
			});
		});
		*/

		describe('Full dates', function() {
			it('12 jan 2018', function() {
				return date('12 jan 2018')
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2018,
							month: 0,
							day: 12
						})
					);
			});

			it('12 jan, 2018', function() {
				return date('12 jan, 2018')
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2018,
							month: 0,
							day: 12
						})
					);
			});

			it('12 jan in 2018', function() {
				return date('12 jan in 2018')
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2018,
							month: 0,
							day: 12
						})
					);
			});

			it('12 jan in 4 years', function() {
				return date('12 jan in 4 years', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2014,
							month: 0,
							day: 12
						})
					);
			});

			it('2010 02 01', function() {
				return date('2010 02 01')
					.then(v => {
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 1,
							day: 1
						})
					});
			});

			it('2010-01-05', function() {
				return date('2010-01-05')
					.then(v => {
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 0,
							day: 5
						})
					});
			});

			it('01 02 2010', function() {
				return date('01 02 2010')
					.then(v => {
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 0,
							day: 2
						})
					});
			});

			it('01/02/2010', function() {
				return date('01/02/2010')
					.then(v => {
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 0,
							day: 2
						})
					});
			});
		});

		describe('Relative dates', function() {
			it('today', function() {
				return date('today', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 0,
							day: 1
						})
					);
			});

			it('tomorrow', function() {
				return date('tomorrow', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 0,
							day: 2
						})
					);
			});

			it('yesterday', function() {
				return date('yesterday', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2009,
							month: 11,
							day: 31
						})
					);
			});

			it('day after tomorrow', function() {
				return date('day after tomorrow', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 0,
							day: 3
						})
					);
			});

			it('this week - Sunday start', function() {
				return date('this week', { now: new Date(2010, 0, 1), weekStart: 7 })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'week',
							year: 2009,
							month: 11,
							day: 27
						})
					);
			});

			it('end of week - Sunday start', function() {
				return date('end of week', { now: new Date(2010, 0, 1), weekStartsOn: 7 })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'week',
							year: 2010,
							month: 0,
							day: 2
						})
					);
			});

			it('end of week - Monday start', function() {
				return date('end of week', { now: new Date(2010, 0, 1), weekStartsOn: 1 })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'week',
							year: 2010,
							month: 0,
							day: 3
						})
					);
			});

			it('start of week', function() {
				return date('start of week', { now: new Date(2010, 0, 1), weekStartsOn: 1 })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'week',
							year: 2009,
							month: 11,
							day: 28
						})
					);
			});

			it('in 1 day', function() {
				return date('in 1 day', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 0,
							day: 2
						})
					);
			});

			it('in 3 days', function() {
				return date('in 3 days', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 0,
							day: 4
						})
					);
			});

			it('in 2 months and 3 days', function() {
				return date('in 2 months and 3 days', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 2,
							day: 4
						})
					);
			});

			it('in 1 week', function() {
				return date('in 1 week', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'week',
							year: 2010,
							month: 0,
							day: 8
						})
					);
			});

			it('in two weeks', function() {
				return date('in 2 weeks', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'week',
							year: 2010,
							month: 0,
							day: 15
						})
					);
			});

			it('2nd this month', function() {
				return date('2nd this month', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 0,
							day: 2
						})
					);
			});

			it('the 2nd of this month', function() {
				return date('the 2nd this month', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2010,
							month: 0,
							day: 2
						})
					);
			});

			it('in 1 year', function() {
				return date('in 1 year', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'year',
							year: 2011,
							month: 0,
							day: 1
						})
					);
			});

			it('week 12 in 1 year', function() {
				return date('week 12 in 1 year', { now: new Date(2010, 0, 1) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'week',
							year: 2011,
							month: 2,
							day: 27
						})
					);
			});
		});

		describe('Relative dates within year', function() {
			it('12 jan next year', function() {
				return date('12 jan next year')
				.then(v =>
					expect(v).to.deep.equal({
						period: 'day',
						year: new Date().getFullYear() + 1,
						month: 0,
						day: 12
					})
				);
			});

			// TODO: This is a range, move test when implemented
			/*
			it('this month 2018', function() {
				const now = new Date(2010, 0, 1);
				return date('this month 2018', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						year: 2018,
						month: 0
					})
				);
			});
			*/

			it('first friday in 2018', function() {
				return date('first friday in 2018')
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2018,
							month: 0,
							day: 5
						})
					);
			});

			it('first friday in 4 years', function() {
				return date('first friday in 4 years', { now: new Date(2014, 2, 22) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2018,
							month: 2,
							day: 23
						})
					);
			});

			it('first friday in may 2018', function() {
				return date('first friday in may 2018')
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2018,
							month: 4,
							day: 4
						})
					);
			});

			it('first friday in may in 4 years', function() {
				return date('first friday in may in 4 years', { now: new Date(2014, 2, 22) })
					.then(v =>
						expect(v).to.deep.equal({
							period: 'day',
							year: 2018,
							month: 4,
							day: 4
						})
					);
			});
		});
	});
});
