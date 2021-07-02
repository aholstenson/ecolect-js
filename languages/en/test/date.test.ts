import { mapDate } from '@ecolect/type-datetime';

import { dateGraph } from '../src/dateGraph';
import { EnglishLanguage } from '../src/EnglishLanguage';

import { testRunner } from './helpers';

const test = testRunner(new EnglishLanguage(), dateGraph, mapDate);

describe('English', function() {
	describe('Date', function() {
		describe('Weekdays', function() {
			test('this tuesday', { now: new Date(2017, 0, 24) }, {
				year: 2017,
				month: 1,
				dayOfMonth: 31
			});

			test('this Fri', { now: new Date(2017, 0, 24) }, {
				year: 2017,
				month: 1,
				dayOfMonth: 27
			});

			test('this Monday', { now: new Date(2017, 0, 24) }, {
				year: 2017,
				month: 1,
				dayOfMonth: 30
			});

			test('on Monday', { now: new Date(2017, 0, 24) }, {
				year: 2017,
				month: 1,
				dayOfMonth: 30
			});
		});

		describe('Day', function() {
			test('12th', { now: new Date(2017, 0, 24) }, {
				year: 2017,
				month: 2,
				dayOfMonth: 12
			});

			test('12', { now: new Date(2017, 0, 24) }, {
				year: 2017,
				month: 2,
				dayOfMonth: 12
			});

			test('32nd', { now: new Date(2017, 0, 24) }, null);
		});

		describe('Month + day', function() {
			test('jan 12', { now: new Date(2017, 0, 24) }, {
				year: 2017,
				month: 1,
				dayOfMonth: 12
			});

			test('12 jan', { now: new Date(2017, 0, 24) }, {
				year: 2017,
				month: 1,
				dayOfMonth: 12
			});

			test('jan 12th', { now: new Date(2017, 2, 24) }, {
				year: 2018,
				month: 1,
				dayOfMonth: 12
			});

			test('12th november', { now: new Date(2017, 0, 24) }, {
				year: 2017,
				month: 11,
				dayOfMonth: 12
			});

			test('12th of november', { now: new Date(2017, 0, 24) }, {
				year: 2017,
				month: 11,
				dayOfMonth: 12
			});

			test('4/12', { now: new Date(2017, 0, 24) }, {
				year: 2017,
				month: 4,
				dayOfMonth: 12
			});
		});

		describe('Year', function() {
			test('2018', { now: new Date(2017, 0, 24) }, {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			});

			test('this year', { now: new Date(2017, 0, 24) }, {
				year: 2017,
				month: 1,
				dayOfMonth: 1
			});
		});

		describe('Relative day of week in month', function() {
			test('first Friday May', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 5,
				dayOfMonth: 7
			});

			test('first Friday in May', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 5,
				dayOfMonth: 7
			});

			test('3rd Friday in May', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 5,
				dayOfMonth: 21
			});


			test('3rd Friday in May 2010', { now: new Date(2005, 0, 1) }, {
				year: 2010,
				month: 5,
				dayOfMonth: 21
			});

			test('Friday in May', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 5,
				dayOfMonth: 7
			});
		});

		describe('Month + Year', function() {
			test('may 2018', {}, {
				year: 2018,
				month: 5,
				dayOfMonth: 1
			});

			test('last month 2018', { now: new Date(2010, 2, 1) }, {
				year: 2018,
				month: 12,
				dayOfMonth: 1
			});

			test('first month 2019', { now: new Date(2010, 2, 1) }, {
				year: 2019,
				month: 1,
				dayOfMonth: 1
			});
		});

		describe('Weeks', function() {
			test('this week', { now: new Date(2010, 1, 5), weekStartsOn: 1, firstWeekContainsDate: 4 }, {
				year: 2010,
				month: 2,
				dayOfMonth: 1
			});

			test('week 2 2018', {}, {
				year: 2018,
				month: 1,
				dayOfMonth: 7
			});

			test('week 2 2018', { weekStartsOn: 1 }, {
				year: 2018,
				month: 1,
				dayOfMonth: 8
			});

			test('Wednesday week 2 2018', { weekStartsOn: 1 }, {
				year: 2018,
				month: 1,
				dayOfMonth: 10
			});

			test('this week', { now: new Date(2010, 0, 1), weekStartsOn: 0 }, {
				year: 2009,
				month: 12,
				dayOfMonth: 27
			});

			test('end of week', { now: new Date(2010, 0, 1), weekStartsOn: 0 }, {
				year: 2010,
				month: 1,
				dayOfMonth: 2
			});

			test('end of week', { now: new Date(2010, 0, 1), weekStartsOn: 1 }, {
				year: 2010,
				month: 1,
				dayOfMonth: 3
			});

			test('start of week', { now: new Date(2010, 0, 1), weekStartsOn: 1 }, {
				year: 2009,
				month: 12,
				dayOfMonth: 28
			});

			test('Tuesday this week', { now: new Date(2010, 1, 5), weekStartsOn: 1, firstWeekContainsDate: 4 }, {
				year: 2010,
				month: 2,
				dayOfMonth: 2
			});

			test('this week Tuesday', { now: new Date(2010, 1, 5), weekStartsOn: 1, firstWeekContainsDate: 4 }, {
				year: 2010,
				month: 2,
				dayOfMonth: 2
			});
		});

		describe('Quarters', function() {
			test('this quarter', { now: new Date(2010, 1, 5) }, {
				year: 2010,
				month: 1,
				dayOfMonth: 1
			});

			test('quarter 2 2018', {}, {
				year: 2018,
				month: 4,
				dayOfMonth: 1
			});

			test('2018Q3', {}, {
				year: 2018,
				month: 7,
				dayOfMonth: 1
			});

			test('end of Q1', { now: new Date(2018, 0, 2) }, {
				year: 2018,
				month: 3,
				dayOfMonth: 31
			});

			test('last quarter', { now: new Date(2018, 0, 2) }, {
				year: 2017,
				month: 10,
				dayOfMonth: 1
			});

			test('previous quarter', { now: new Date(2018, 0, 2) }, {
				year: 2017,
				month: 10,
				dayOfMonth: 1
			});

			test('next quarter', { now: new Date(2018, 0, 2) }, {
				year: 2018,
				month: 4,
				dayOfMonth: 1
			});
		});

		describe('Full dates', function() {
			test('12 jan 2018', {}, {
				year: 2018,
				month: 1,
				dayOfMonth: 12
			});

			test('12 jan, 2018', {}, {
				year: 2018,
				month: 1,
				dayOfMonth: 12
			});

			test('12 jan in 2018', {}, {
				year: 2018,
				month: 1,
				dayOfMonth: 12
			});

			test('12 jan in 4 years', { now: new Date(2010, 0, 1) }, {
				year: 2014,
				month: 1,
				dayOfMonth: 12
			});

			test('2010 02 01', {}, {
				year: 2010,
				month: 2,
				dayOfMonth: 1
			});

			test('2010-01-05', {}, {
				year: 2010,
				month: 1,
				dayOfMonth: 5
			});

			test('01 02 2010', {}, {
				year: 2010,
				month: 1,
				dayOfMonth: 2
			});

			test('01/02/2010', {}, {
				year: 2010,
				month: 1,
				dayOfMonth: 2
			});
		});

		describe('Relative dates', function() {
			test('today', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 1,
				dayOfMonth: 1
			});

			test('tomorrow', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 1,
				dayOfMonth: 2
			});

			test('yesterday', { now: new Date(2010, 0, 1) }, {
				year: 2009,
				month: 12,
				dayOfMonth: 31
			});

			test('day after tomorrow', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 1,
				dayOfMonth: 3
			});

			test('in 3 days', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 1,
				dayOfMonth: 4
			});

			test('in 1 d', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 1,
				dayOfMonth: 2
			});

			test('1 day after 2018-01-02', { now: new Date(2010, 0, 1) }, {
				year: 2018,
				month: 1,
				dayOfMonth: 3
			});

			test('2018-01-02 + 1 day', { now: new Date(2010, 0, 1) }, {
				year: 2018,
				month: 1,
				dayOfMonth: 3
			});

			test('2018-01-02 plus 1 day', { now: new Date(2010, 0, 1) }, {
				year: 2018,
				month: 1,
				dayOfMonth: 3
			});

			test('1 day before 2018-01-02', { now: new Date(2010, 0, 1) }, {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			});

			test('2018-01-02 - 1 day', { now: new Date(2010, 0, 1) }, {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			});

			test('2018-01-02 minus 1 day', { now: new Date(2010, 0, 1) }, {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			});

			test('in 2 months and 3 days', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 3,
				dayOfMonth: 4
			});

			test('in 1 week', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 1,
				dayOfMonth: 8
			});

			test('in two weeks', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 1,
				dayOfMonth: 15
			});

			test('in 2w', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 1,
				dayOfMonth: 15
			});

			test('in 2wks', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 1,
				dayOfMonth: 15
			});

			test('1 week', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 1,
				dayOfMonth: 8
			});

			test('2nd this month', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 1,
				dayOfMonth: 2
			});

			test('the 2nd this month', { now: new Date(2010, 0, 1) }, {
				year: 2010,
				month: 1,
				dayOfMonth: 2
			});

			test('in 1 year', { now: new Date(2010, 0, 1) }, {
				year: 2011,
				month: 1,
				dayOfMonth: 1
			});

			test('in 1y', { now: new Date(2010, 0, 1) }, {
				year: 2011,
				month: 1,
				dayOfMonth: 1
			});

			test('in 1 yr', { now: new Date(2010, 0, 1) }, {
				year: 2011,
				month: 1,
				dayOfMonth: 1
			});

			test('2 yrs from today', { now: new Date(2010, 0, 1) }, {
				year: 2012,
				month: 1,
				dayOfMonth: 1
			});

			test('week 12 in 1 year', { now: new Date(2010, 0, 1), weekStartsOn: 1, firstWeekContainsDate: 4 }, {
				year: 2011,
				month: 3,
				dayOfMonth: 21
			});

			test('3 days ago', { now: new Date(2010, 0, 1) }, {
				year: 2009,
				month: 12,
				dayOfMonth: 29
			});

			test('3 weeks ago', { now: new Date(2010, 0, 1) }, {
				year: 2009,
				month: 12,
				dayOfMonth: 11
			});

			test('1 month and 3 days ago', { now: new Date(2010, 0, 1) }, {
				year: 2009,
				month: 11,
				dayOfMonth: 28
			});

			test('1 mon 3 d ago', { now: new Date(2010, 0, 1) }, {
				year: 2009,
				month: 11,
				dayOfMonth: 28
			});
		});

		describe('Relative dates within year', function() {
			test('12 jan next year', {}, {
				year: new Date().getFullYear() + 1,
				month: 1,
				dayOfMonth: 12
			});

			test('this month 2018', { now: new Date(2010, 0, 1) }, {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			});

			test('first friday in 2018', {}, {
				year: 2018,
				month: 1,
				dayOfMonth: 5
			});

			test('first friday in 4 years', { now: new Date(2014, 2, 22) }, {
				year: 2018,
				month: 3,
				dayOfMonth: 23
			});

			test('first friday in may 2018', {}, {
				year: 2018,
				month: 5,
				dayOfMonth: 4
			});

			test('first friday in may in 4 years', { now: new Date(2014, 2, 22) }, {
				year: 2018,
				month: 5,
				dayOfMonth: 4
			});

			test('2 days after first friday in may in 4 years', { now: new Date(2014, 2, 22) }, {
				year: 2018,
				month: 5,
				dayOfMonth: 6
			});
		});

		describe('Interval modifiers', function() {
			test('end of jan next year', { now: new Date(2014, 2, 22) }, {
				year: 2015,
				month: 1,
				dayOfMonth: 31
			});

			test('end of next year', { now: new Date(2014, 2, 22) }, {
				year: 2015,
				month: 12,
				dayOfMonth: 31
			});

			test('start of week 12', { now: new Date(2014, 2, 22) }, {
				year: 2014,
				month: 3,
				dayOfMonth: 16
			});

			test('end of week 12', { now: new Date(2014, 2, 22) }, {
				year: 2014,
				month: 3,
				dayOfMonth: 22
			});
		});
	});
});
