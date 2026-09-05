import { mapDate } from '@ecolect/type-datetime';

import { dateGraph } from '../src/dateGraph.js';
import { EnglishLanguage } from '../src/EnglishLanguage.js';

import { testRunner } from './helpers.js';

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

		// The current time in the tests below is Tuesday January 24th 2017
		const tuesday = new Date(2017, 0, 24);

		// Weeks start on Monday, the first week of the year contains January 4th
		const iso = { weekStartsOn: 1, firstWeekContainsDate: 4 };

		describe('Weekdays relative to today', function() {
			test('tuesday', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 31
			});

			test('next Monday', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 30
			});

			test('Sun', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 29
			});

			test('Thurs', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 26
			});

			test('last Monday', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 23
			});

			test('previous Tuesday', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 17
			});

			test('last Tuesday', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 17
			});

			test('1 day after last monday', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 24
			});

			test('2 days before next friday', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 25
			});
		});

		describe('Day of month limits', function() {
			test('31st', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 31
			});

			test('31st', { now: new Date(2017, 1, 10) }, {
				year: 2017,
				month: 3,
				dayOfMonth: 31
			});

			test('the 31st', { now: new Date(2017, 1, 10) }, {
				year: 2017,
				month: 3,
				dayOfMonth: 31
			});

			test('30th', { now: new Date(2017, 1, 10) }, {
				year: 2017,
				month: 3,
				dayOfMonth: 30
			});

			test('0th', { now: tuesday }, null);

			test('jan 31', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 31
			});

			test('feb 29', { now: tuesday }, {
				year: 2020,
				month: 2,
				dayOfMonth: 29
			});

			test('feb 29', { now: new Date(2016, 0, 24) }, {
				year: 2016,
				month: 2,
				dayOfMonth: 29
			});

			test('feb 29 2016', { now: tuesday }, {
				year: 2016,
				month: 2,
				dayOfMonth: 29
			});

			test('feb 29 2017', { now: tuesday }, null);

			test('feb 30', { now: tuesday }, null);

			test('apr 31', { now: tuesday }, null);
		});

		describe('Numeric formats', function() {
			test('2017/01/24', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 24
			});

			test('2016-02-29', { now: tuesday }, {
				year: 2016,
				month: 2,
				dayOfMonth: 29
			});

			test('12/31/2018', { now: tuesday }, {
				year: 2018,
				month: 12,
				dayOfMonth: 31
			});

			test('january 12, 2018', { now: tuesday }, {
				year: 2018,
				month: 1,
				dayOfMonth: 12
			});

			test('24/01/2017', { now: tuesday }, null);

			test('13/2', { now: tuesday }, null);

			test('2017-13-01', { now: tuesday }, null);

			test('2017-02-30', { now: tuesday }, null);
		});

		describe('Years relative to today', function() {
			test('year 2018', { now: tuesday }, {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			});

			test('the year 2018', { now: tuesday }, {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			});

			test('in 2018', { now: tuesday }, {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			});

			test('last year', { now: tuesday }, {
				year: 2016,
				month: 1,
				dayOfMonth: 1
			});

			test('2 years ago', { now: tuesday }, {
				year: 2015,
				month: 1,
				dayOfMonth: 24
			});
		});

		describe('Months relative to today', function() {
			test('next month', { now: tuesday }, {
				year: 2017,
				month: 2,
				dayOfMonth: 1
			});

			test('last month', { now: tuesday }, {
				year: 2016,
				month: 12,
				dayOfMonth: 1
			});

			test('in 2 months', { now: tuesday }, {
				year: 2017,
				month: 3,
				dayOfMonth: 24
			});

			test('2 months ago', { now: tuesday }, {
				year: 2016,
				month: 11,
				dayOfMonth: 24
			});

			test('in january 2018', { now: tuesday }, {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			});

			test('jan of 18', { now: tuesday }, {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			});
		});

		describe('Weeks of a year', function() {
			test('week 5 2017', { now: tuesday, ...iso }, {
				year: 2017,
				month: 1,
				dayOfMonth: 30
			});

			test('week 1 2017', { now: tuesday, ...iso }, {
				year: 2017,
				month: 1,
				dayOfMonth: 2
			});

			test('week 1 2017', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 1
			});

			test('week 53 2020', { now: tuesday, ...iso }, {
				year: 2020,
				month: 12,
				dayOfMonth: 28
			});

			test('week 53 2017', { now: tuesday, ...iso }, null);

			test('week 0', { now: tuesday, ...iso }, null);

			test('week 60', { now: tuesday, ...iso }, null);

			test('monday week 2 2018', { now: tuesday, ...iso }, {
				year: 2018,
				month: 1,
				dayOfMonth: 8
			});
		});

		describe('Weeks relative to today', function() {
			test('next week', { now: tuesday, ...iso }, {
				year: 2017,
				month: 1,
				dayOfMonth: 30
			});

			test('last week', { now: tuesday, ...iso }, {
				year: 2017,
				month: 1,
				dayOfMonth: 16
			});

			test('previous week', { now: tuesday, ...iso }, {
				year: 2017,
				month: 1,
				dayOfMonth: 16
			});

			test('this week', { now: new Date(2019, 11, 30), ...iso }, {
				year: 2019,
				month: 12,
				dayOfMonth: 30
			});

			test('next week', { now: new Date(2019, 11, 30), ...iso }, {
				year: 2020,
				month: 1,
				dayOfMonth: 6
			});

			test('last week', { now: new Date(2019, 11, 30), ...iso }, {
				year: 2019,
				month: 12,
				dayOfMonth: 23
			});

			test('this week', { now: new Date(2021, 0, 1), ...iso }, {
				year: 2020,
				month: 12,
				dayOfMonth: 28
			});

			test('end of next week', { now: tuesday, ...iso }, {
				year: 2017,
				month: 2,
				dayOfMonth: 5
			});

			test('start of last week', { now: tuesday, ...iso }, {
				year: 2017,
				month: 1,
				dayOfMonth: 16
			});
		});

		describe('Weekdays within a week', function() {
			test('monday this week', { now: tuesday, ...iso }, {
				year: 2017,
				month: 1,
				dayOfMonth: 23
			});

			test('tuesday this week', { now: tuesday, ...iso }, {
				year: 2017,
				month: 1,
				dayOfMonth: 24
			});

			test('sunday this week', { now: tuesday, ...iso }, {
				year: 2017,
				month: 1,
				dayOfMonth: 29
			});

			test('sunday this week', { now: tuesday, weekStartsOn: 0 }, {
				year: 2017,
				month: 1,
				dayOfMonth: 22
			});

			test('saturday this week', { now: tuesday, weekStartsOn: 0 }, {
				year: 2017,
				month: 1,
				dayOfMonth: 28
			});

			test('monday next week', { now: tuesday, ...iso }, {
				year: 2017,
				month: 1,
				dayOfMonth: 30
			});

			test('friday last week', { now: tuesday, ...iso }, {
				year: 2017,
				month: 1,
				dayOfMonth: 20
			});
		});

		describe('Quarters relative to today', function() {
			test('q1', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 1
			});

			test('q4', { now: tuesday }, {
				year: 2017,
				month: 10,
				dayOfMonth: 1
			});

			test('q5', { now: tuesday }, null);

			test('q1 2018', { now: tuesday }, {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			});

			test('first quarter', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 1
			});

			test('start of the quarter', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 1
			});

			test('end of the quarter', { now: tuesday }, {
				year: 2017,
				month: 3,
				dayOfMonth: 31
			});

			test('in 1 quarter', { now: tuesday }, {
				year: 2017,
				month: 4,
				dayOfMonth: 24
			});

			test('1 quarter ago', { now: tuesday }, {
				year: 2016,
				month: 10,
				dayOfMonth: 24
			});

			test('2 quarters from now', { now: tuesday }, {
				year: 2017,
				month: 7,
				dayOfMonth: 24
			});
		});

		describe('Relative days', function() {
			test('day before yesterday', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 22
			});

			test('the day before yesterday', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 22
			});

			test('3 days from now', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 27
			});

			test('a day ago', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 23
			});

			test('a week ago', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 17
			});

			test('in a week', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 31
			});

			test('in a month', { now: tuesday }, {
				year: 2017,
				month: 2,
				dayOfMonth: 24
			});

			test('a year ago', { now: tuesday }, {
				year: 2016,
				month: 1,
				dayOfMonth: 24
			});
		});

		describe('Weekday within a period', function() {
			test('first friday in may 2015', { now: tuesday }, {
				year: 2015,
				month: 5,
				dayOfMonth: 1
			});

			test('first friday in 2016', { now: tuesday }, {
				year: 2016,
				month: 1,
				dayOfMonth: 1
			});

			test('second tuesday of may', { now: tuesday }, {
				year: 2017,
				month: 5,
				dayOfMonth: 9
			});

			test('first monday of next month', { now: tuesday }, {
				year: 2017,
				month: 2,
				dayOfMonth: 6
			});

			test('5th monday in january', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 30
			});

			test('fifth friday in january', { now: tuesday }, null);

			test('last friday in january', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 27
			});

			test('last friday of january', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 27
			});

			test('last friday in feb 2016', { now: tuesday }, {
				year: 2016,
				month: 2,
				dayOfMonth: 26
			});

			test('last monday in 2018', { now: tuesday }, {
				year: 2018,
				month: 12,
				dayOfMonth: 31
			});

			test('last friday next month', { now: tuesday }, {
				year: 2017,
				month: 2,
				dayOfMonth: 24
			});

			test('last friday in 2 months', { now: tuesday }, {
				year: 2017,
				month: 3,
				dayOfMonth: 31
			});

			test('tuesday in 2 weeks', { now: tuesday }, {
				year: 2017,
				month: 2,
				dayOfMonth: 7
			});
		});

		describe('Edges of periods', function() {
			test('start of month', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 1
			});

			test('end of month', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 31
			});

			test('end of the month', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 31
			});

			test('first day of the month', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 1
			});

			test('last day of the month', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 31
			});

			test('start of the year', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 1
			});

			test('end of year', { now: tuesday }, {
				year: 2017,
				month: 12,
				dayOfMonth: 31
			});

			test('end of the year', { now: tuesday }, {
				year: 2017,
				month: 12,
				dayOfMonth: 31
			});

			test('start of the week', { now: tuesday, ...iso }, {
				year: 2017,
				month: 1,
				dayOfMonth: 23
			});

			test('end of the week', { now: tuesday, ...iso }, {
				year: 2017,
				month: 1,
				dayOfMonth: 29
			});

			test('first day of next month', { now: tuesday }, {
				year: 2017,
				month: 2,
				dayOfMonth: 1
			});

			test('last day of january', { now: tuesday }, {
				year: 2017,
				month: 1,
				dayOfMonth: 31
			});

			test('last day of 2018', { now: tuesday }, {
				year: 2018,
				month: 12,
				dayOfMonth: 31
			});

			test('last day of feb 2016', { now: tuesday }, {
				year: 2016,
				month: 2,
				dayOfMonth: 29
			});

			test('end of feb 2017', { now: tuesday }, {
				year: 2017,
				month: 2,
				dayOfMonth: 28
			});

			test('end of next month', { now: tuesday }, {
				year: 2017,
				month: 2,
				dayOfMonth: 28
			});

			test('end of q4 2018', { now: tuesday }, {
				year: 2018,
				month: 12,
				dayOfMonth: 31
			});
		});
	});
});
