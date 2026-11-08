
import { dateIntervalGraph } from '../../../src/language/en/dateIntervalGraph.js';
import { EnglishLanguage } from '../../../src/language/en/EnglishLanguage.js';
import { en } from '../../../src/language/en/index.js';
import { mapDateInterval } from '../../../src/type-datetime/index.js';
import { dateIntervalValue, dateValue } from '../../../src/values/index.js';

import { testRunner } from './helpers.js';

const test = testRunner(new EnglishLanguage(), dateIntervalGraph, mapDateInterval);

describe('English', () => {
	describe('Date Interval', () => {

		test('2018', {}, {
			start: {
				year: 2018,
				month: 1,
				day: 1
			},
			end: {
				year: 2018,
				month: 12,
				day: 31
			}
		});

		test('February 2018', { now: new Date(2010, 2, 1) }, {
			start: {
				year: 2018,
				month: 2,
				day: 1
			},
			end: {
				year: 2018,
				month: 2,
				day: 28
			}
		});

		test('2018 to 2019', { now: new Date(2010, 2, 1) }, {
			start: {
				year: 2018,
				month: 1,
				day: 1
			},
			end: {
				year: 2019,
				month: 12,
				day: 31
			}
		});

		test('2018 - 2019', { now: new Date(2010, 2, 1) }, {
			start: {
				year: 2018,
				month: 1,
				day: 1
			},
			end: {
				year: 2019,
				month: 12,
				day: 31
			}
		});

		test('February to March', { now: new Date(2010, 2, 1) }, {
			start: {
				year: 2010,
				month: 2,
				day: 1
			},
			end: {
				year: 2010,
				month: 3,
				day: 31
			}
		});

		test('February 2009 to March', { now: new Date(2010, 2, 1) }, {
			start: {
				year: 2009,
				month: 2,
				day: 1
			},
			end: {
				year: 2009,
				month: 3,
				day: 31
			}
		});

		test('February last year to March this year', { now: new Date(2010, 2, 1) }, {
			start: {
				year: 2009,
				month: 2,
				day: 1
			},
			end: {
				year: 2010,
				month: 3,
				day: 31
			}
		});

		test('2018-01-01 to 2018-01-05', {}, {
			start: {
				year: 2018,
				month: 1,
				day: 1
			},
			end: {
				year: 2018,
				month: 1,
				day: 5
			}
		});

		// A single month is read as a date is read, so it is the next February
		test('February', { now: new Date(2010, 8, 1) }, {
			start: {
				year: 2011,
				month: 2,
				day: 1
			},
			end: {
				year: 2011,
				month: 2,
				day: 28
			}
		});

		test('February to March', { now: new Date(2010, 8, 1) }, {
			start: {
				year: 2010,
				month: 2,
				day: 1
			},
			end: {
				year: 2010,
				month: 3,
				day: 31
			}
		});

		test('February to March 2009', { now: new Date(2010, 8, 1) }, {
			start: {
				year: 2009,
				month: 2,
				day: 1
			},
			end: {
				year: 2009,
				month: 3,
				day: 31
			}
		});

		test('between February and March 2009', { now: new Date(2010, 8, 1) }, {
			start: {
				year: 2009,
				month: 2,
				day: 1
			},
			end: {
				year: 2009,
				month: 3,
				day: 31
			}
		});

		test('2018-05-02', {}, {
			start: {
				year: 2018,
				month: 5,
				day: 2
			},
			end: {
				year: 2018,
				month: 5,
				day: 2
			}
		});

		test('week 42', { now: new Date(2012, 8, 1) }, {
			start: {
				year: 2012,
				month: 10,
				day: 14
			},
			end: {
				year: 2012,
				month: 10,
				day: 20
			}
		});

		test('Friday to Tuesday', { now: new Date(2012, 8, 1) }, {
			start: {
				year: 2012,
				month: 9,
				day: 7
			},
			end: {
				year: 2012,
				month: 9,
				day: 11
			}
		});

		test('from Friday to Tuesday', { now: new Date(2012, 8, 1) }, {
			start: {
				year: 2012,
				month: 9,
				day: 7
			},
			end: {
				year: 2012,
				month: 9,
				day: 11
			}
		});

		test('January 12th - 15th', { now: new Date(2012, 8, 1) }, {
			start: {
				year: 2012,
				month: 1,
				day: 12
			},
			end: {
				year: 2012,
				month: 1,
				day: 15
			}
		});

		test('today', { now: new Date(2012, 8, 1) }, {
			start: {
				year: 2012,
				month: 9,
				day: 1
			},
			end: {
				year: 2012,
				month: 9,
				day: 1
			}
		});

		test('tomorrow', { now: new Date(2012, 8, 1) }, {
			start: {
				year: 2012,
				month: 9,
				day: 2
			},
			end: {
				year: 2012,
				month: 9,
				day: 2
			}
		});

		test('yesterday', { now: new Date(2012, 8, 3) }, {
			start: {
				year: 2012,
				month: 9,
				day: 2
			},
			end: {
				year: 2012,
				month: 9,
				day: 2
			}
		});

		test('any time', { now: new Date(2012, 8, 3) }, {
			start: null,
			end: null
		});

		test('in the future', { now: new Date(2012, 8, 3) }, {
			start: {
				year: 2012,
				month: 9,
				day: 4
			},
			end: null
		});

		test('in the past', { now: new Date(2012, 8, 3) }, {
			start: null,
			end: {
				year: 2012,
				month: 9,
				day: 2
			}
		});

		test('after today', { now: new Date(2012, 8, 3) }, {
			start: {
				year: 2012,
				month: 9,
				day: 4
			},
			end: null
		});

		test('from today', { now: new Date(2012, 8, 3) }, {
			start: {
				year: 2012,
				month: 9,
				day: 3
			},
			end: null
		});

		test('from 2020', { now: new Date(2012, 8, 3) }, {
			start: {
				year: 2020,
				month: 1,
				day: 1
			},
			end: null
		});

		test('from 2020 to 2030', { now: new Date(2012, 8, 3) }, {
			start: {
				year: 2020,
				month: 1,
				day: 1
			},
			end: {
				year: 2030,
				month: 12,
				day: 31
			}
		});

		test('before today', { now: new Date(2012, 8, 3) }, {
			start: null,
			end: {
				year: 2012,
				month: 9,
				day: 2
			}
		});

		test('until today', { now: new Date(2012, 8, 3) }, {
			start: null,
			end: {
				year: 2012,
				month: 9,
				day: 3
			}
		});

		/*
		 * Rolling ranges are counted from the current day, which is
		 * Wednesday September 5th 2012 in these tests.
		 */

		test('last 7 days', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				day: 30
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('the last 7 days', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				day: 30
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('past 7 days', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				day: 30
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('past week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				day: 30
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('the past week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				day: 30
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('the last day', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				day: 5
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('last 24 hours', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				day: 4
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('last 3 months', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 6,
				day: 6
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('previous 2 weeks', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				day: 23
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('next 7 days', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				day: 5
			},
			end: {
				year: 2012,
				month: 9,
				day: 11
			}
		});

		test('the next week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				day: 5
			},
			end: {
				year: 2012,
				month: 9,
				day: 11
			}
		});

		test('coming week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				day: 5
			},
			end: {
				year: 2012,
				month: 9,
				day: 11
			}
		});

		// Named periods keep meaning the previous or next calendar period
		test('last week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				day: 26
			},
			end: {
				year: 2012,
				month: 9,
				day: 1
			}
		});

		test('last month', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				day: 1
			},
			end: {
				year: 2012,
				month: 8,
				day: 31
			}
		});

		test('next week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				day: 9
			},
			end: {
				year: 2012,
				month: 9,
				day: 15
			}
		});

		test('since monday', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				day: 3
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('since 2011', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2011,
				month: 1,
				day: 1
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('since last week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				day: 26
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('year to date', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 1,
				day: 1
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('ytd', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 1,
				day: 1
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('quarter to date', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 7,
				day: 1
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('month to date', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				day: 1
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('week to date', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				day: 2
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('during the last 7 days', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				day: 30
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('in the last 7 days', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				day: 30
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		test('over the past week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				day: 30
			},
			end: {
				year: 2012,
				month: 9,
				day: 5
			}
		});

		// A single relative date covers only the day it describes
		test('7 days', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				day: 12
			},
			end: {
				year: 2012,
				month: 9,
				day: 12
			}
		});

		test('3 days ago', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				day: 2
			},
			end: {
				year: 2012,
				month: 9,
				day: 2
			}
		});

		test('a week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				day: 9
			},
			end: {
				year: 2012,
				month: 9,
				day: 15
			}
		});

		it('a day of the month is the same day as a date', async function() {
			const options = { now: new Date(2026, 10, 8, 13) };
			const date = await dateValue().matcher(en).match('the 5th', options);
			const interval = await dateIntervalValue().matcher(en).match('the 5th', options);

			expect(interval?.start).toEqual(date);
			expect(interval?.end).toEqual(date);
		});

		test('in 99999999999 days', { now: new Date(2026, 10, 8) }, null);

		// A date that does not exist does not give an interval
		test('until feb 30', { now: new Date(2026, 10, 8) }, null);

		test('march 3 to feb 30', { now: new Date(2026, 10, 8) }, null);

		test('feb 30 to march 3', { now: new Date(2026, 10, 8) }, null);

		test('before feb 29 2027', { now: new Date(2026, 10, 8) }, null);

		// After and before a longer period exclude the whole period
		test('after december', { now: new Date(2026, 10, 8) }, {
			start: {
				year: 2027,
				month: 1,
				day: 1
			},
			end: null
		});

		test('before december', { now: new Date(2026, 10, 8) }, {
			start: null,
			end: {
				year: 2026,
				month: 11,
				day: 30
			}
		});

		test('after 2026', { now: new Date(2026, 10, 8) }, {
			start: {
				year: 2027,
				month: 1,
				day: 1
			},
			end: null
		});

		test('before 2027', { now: new Date(2026, 10, 8) }, {
			start: null,
			end: {
				year: 2026,
				month: 12,
				day: 31
			}
		});

		test('after next week', { now: new Date(2026, 10, 8), weekStartsOn: 7 }, {
			start: {
				year: 2026,
				month: 11,
				day: 22
			},
			end: null
		});

		// A start later in the year than today is in the previous year
		test('since the 10th', { now: new Date(2026, 10, 8) }, {
			start: {
				year: 2026,
				month: 10,
				day: 10
			},
			end: {
				year: 2026,
				month: 11,
				day: 8
			}
		});

		test('since december 25', { now: new Date(2027, 0, 5) }, {
			start: {
				year: 2026,
				month: 12,
				day: 25
			},
			end: {
				year: 2027,
				month: 1,
				day: 5
			}
		});

		test('since december', { now: new Date(2026, 10, 8) }, {
			start: {
				year: 2025,
				month: 12,
				day: 1
			},
			end: {
				year: 2026,
				month: 11,
				day: 8
			}
		});

		test('since tomorrow', { now: new Date(2026, 10, 8) }, null);

		// A range where the end is earlier in the year continues into the next year
		test('december 20 to january 5', { now: new Date(2026, 10, 8) }, {
			start: {
				year: 2026,
				month: 12,
				day: 20
			},
			end: {
				year: 2027,
				month: 1,
				day: 5
			}
		});

		test('december to february', { now: new Date(2026, 10, 8) }, {
			start: {
				year: 2026,
				month: 12,
				day: 1
			},
			end: {
				year: 2027,
				month: 2,
				day: 28
			}
		});

		test('december 20 to january 5 2027', { now: new Date(2026, 10, 8) }, {
			start: {
				year: 2026,
				month: 12,
				day: 20
			},
			end: {
				year: 2027,
				month: 1,
				day: 5
			}
		});

		test('jan 30 - 2nd', { now: new Date(2026, 10, 8) }, {
			start: {
				year: 2026,
				month: 1,
				day: 30
			},
			end: {
				year: 2026,
				month: 2,
				day: 2
			}
		});

		test('march 5 2027 to march 3 2026', { now: new Date(2026, 10, 8) }, null);
	});
});
