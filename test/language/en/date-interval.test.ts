
import { dateIntervalGraph } from '../../../src/language/en/dateIntervalGraph.js';
import { EnglishLanguage } from '../../../src/language/en/EnglishLanguage.js';
import { mapDateInterval } from '../../../src/type-datetime/index.js';

import { testRunner } from './helpers.js';

const test = testRunner(new EnglishLanguage(), dateIntervalGraph, mapDateInterval);

describe('English', () => {
	describe('Date Interval', () => {

		test('2018', {}, {
			start: {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			},
			end: {
				year: 2018,
				month: 12,
				dayOfMonth: 31
			}
		});

		test('February 2018', { now: new Date(2010, 2, 1) }, {
			start: {
				year: 2018,
				month: 2,
				dayOfMonth: 1
			},
			end: {
				year: 2018,
				month: 2,
				dayOfMonth: 28
			}
		});

		test('2018 to 2019', { now: new Date(2010, 2, 1) }, {
			start: {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			},
			end: {
				year: 2019,
				month: 12,
				dayOfMonth: 31
			}
		});

		test('2018 - 2019', { now: new Date(2010, 2, 1) }, {
			start: {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			},
			end: {
				year: 2019,
				month: 12,
				dayOfMonth: 31
			}
		});

		test('February to March', { now: new Date(2010, 2, 1) }, {
			start: {
				year: 2010,
				month: 2,
				dayOfMonth: 1
			},
			end: {
				year: 2010,
				month: 3,
				dayOfMonth: 31
			}
		});

		test('February 2009 to March', { now: new Date(2010, 2, 1) }, {
			start: {
				year: 2009,
				month: 2,
				dayOfMonth: 1
			},
			end: {
				year: 2009,
				month: 3,
				dayOfMonth: 31
			}
		});

		test('February last year to March this year', { now: new Date(2010, 2, 1) }, {
			start: {
				year: 2009,
				month: 2,
				dayOfMonth: 1
			},
			end: {
				year: 2010,
				month: 3,
				dayOfMonth: 31
			}
		});

		test('2018-01-01 to 2018-01-05', {}, {
			start: {
				year: 2018,
				month: 1,
				dayOfMonth: 1
			},
			end: {
				year: 2018,
				month: 1,
				dayOfMonth: 5
			}
		});

		test('February to March', { now: new Date(2010, 8, 1) }, {
			start: {
				year: 2010,
				month: 2,
				dayOfMonth: 1
			},
			end: {
				year: 2010,
				month: 3,
				dayOfMonth: 31
			}
		});

		test('February to March 2009', { now: new Date(2010, 8, 1) }, {
			start: {
				year: 2009,
				month: 2,
				dayOfMonth: 1
			},
			end: {
				year: 2009,
				month: 3,
				dayOfMonth: 31
			}
		});

		test('between February and March 2009', { now: new Date(2010, 8, 1) }, {
			start: {
				year: 2009,
				month: 2,
				dayOfMonth: 1
			},
			end: {
				year: 2009,
				month: 3,
				dayOfMonth: 31
			}
		});

		test('2018-05-02', {}, {
			start: {
				year: 2018,
				month: 5,
				dayOfMonth: 2
			},
			end: {
				year: 2018,
				month: 5,
				dayOfMonth: 2
			}
		});

		test('week 42', { now: new Date(2012, 8, 1) }, {
			start: {
				year: 2012,
				month: 10,
				dayOfMonth: 14
			},
			end: {
				year: 2012,
				month: 10,
				dayOfMonth: 20
			}
		});

		test('Friday to Tuesday', { now: new Date(2012, 8, 1) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 7
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 11
			}
		});

		test('from Friday to Tuesday', { now: new Date(2012, 8, 1) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 7
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 11
			}
		});

		test('January 12th - 15th', { now: new Date(2012, 8, 1) }, {
			start: {
				year: 2012,
				month: 1,
				dayOfMonth: 12
			},
			end: {
				year: 2012,
				month: 1,
				dayOfMonth: 15
			}
		});

		test('today', { now: new Date(2012, 8, 1) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 1
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 1
			}
		});

		test('tomorrow', { now: new Date(2012, 8, 1) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 2
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 2
			}
		});

		test('yesterday', { now: new Date(2012, 8, 3) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 2
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 2
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
				dayOfMonth: 4
			},
			end: null
		});

		test('in the past', { now: new Date(2012, 8, 3) }, {
			start: null,
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 2
			}
		});

		test('after today', { now: new Date(2012, 8, 3) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 4
			},
			end: null
		});

		test('from today', { now: new Date(2012, 8, 3) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 3
			},
			end: null
		});

		test('from 2020', { now: new Date(2012, 8, 3) }, {
			start: {
				year: 2020,
				month: 1,
				dayOfMonth: 1
			},
			end: null
		});

		test('from 2020 to 2030', { now: new Date(2012, 8, 3) }, {
			start: {
				year: 2020,
				month: 1,
				dayOfMonth: 1
			},
			end: {
				year: 2030,
				month: 12,
				dayOfMonth: 31
			}
		});

		test('before today', { now: new Date(2012, 8, 3) }, {
			start: null,
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 2
			}
		});

		test('until today', { now: new Date(2012, 8, 3) }, {
			start: null,
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 3
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
				dayOfMonth: 30
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('the last 7 days', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				dayOfMonth: 30
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('past 7 days', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				dayOfMonth: 30
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('past week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				dayOfMonth: 30
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('the past week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				dayOfMonth: 30
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('the last day', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('last 24 hours', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 4
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('last 3 months', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 6,
				dayOfMonth: 6
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('previous 2 weeks', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				dayOfMonth: 23
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('next 7 days', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 11
			}
		});

		test('the next week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 11
			}
		});

		test('coming week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 11
			}
		});

		// Named periods keep meaning the previous or next calendar period
		test('last week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				dayOfMonth: 26
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 1
			}
		});

		test('last month', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				dayOfMonth: 1
			},
			end: {
				year: 2012,
				month: 8,
				dayOfMonth: 31
			}
		});

		test('next week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 9
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 15
			}
		});

		test('since monday', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 3
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('since 2011', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2011,
				month: 1,
				dayOfMonth: 1
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('since last week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				dayOfMonth: 26
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('year to date', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 1,
				dayOfMonth: 1
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('ytd', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 1,
				dayOfMonth: 1
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('quarter to date', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 7,
				dayOfMonth: 1
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('month to date', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 1
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('week to date', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 2
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('during the last 7 days', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				dayOfMonth: 30
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('in the last 7 days', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				dayOfMonth: 30
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		test('over the past week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 8,
				dayOfMonth: 30
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 5
			}
		});

		// A single relative date covers only the day it describes
		test('7 days', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 12
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 12
			}
		});

		test('3 days ago', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 2
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 2
			}
		});

		test('a week', { now: new Date(2012, 8, 5) }, {
			start: {
				year: 2012,
				month: 9,
				dayOfMonth: 9
			},
			end: {
				year: 2012,
				month: 9,
				dayOfMonth: 15
			}
		});
	});
});
