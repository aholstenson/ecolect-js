import en from '../../../src/language/en';
import { testRunner } from '../helpers';

const test = testRunner(en.dateInterval);

describe('English', () => {
	describe('Date Interval', () => {

		test('2018', {}, {
			start: {
				period: 'year',
				year: 2018,
				month: 0,
				day: 1
			},
			end: {
				period: 'year',
				year: 2018,
				month: 11,
				day: 31
			}
		});

		test('February 2018', { now: new Date(2010, 2, 1) }, {
			start: {
				period: 'month',
				year: 2018,
				month: 1,
				day: 1
			},
			end: {
				period: 'month',
				year: 2018,
				month: 1,
				day: 28
			}
		});

		test('2018 to 2019', { now: new Date(2010, 2, 1) }, {
			start: {
				period: 'year',
				year: 2018,
				month: 0,
				day: 1
			},
			end: {
				period: 'year',
				year: 2019,
				month: 11,
				day: 31
			}
		});

		test('2018 - 2019', { now: new Date(2010, 2, 1) }, {
			start: {
				period: 'year',
				year: 2018,
				month: 0,
				day: 1
			},
			end: {
				period: 'year',
				year: 2019,
				month: 11,
				day: 31
			}
		});

		test('February to March', { now: new Date(2010, 2, 1) }, {
			start: {
				period: 'month',
				year: 2010,
				month: 1,
				day: 1
			},
			end: {
				period: 'month',
				year: 2010,
				month: 2,
				day: 31
			}
		});

		test('February 2009 to March', { now: new Date(2010, 2, 1) }, {
			start: {
				period: 'month',
				year: 2009,
				month: 1,
				day: 1
			},
			end: {
				period: 'month',
				year: 2009,
				month: 2,
				day: 31
			}
		});

		test('February last year to March this year', { now: new Date(2010, 2, 1) }, {
			start: {
				period: 'month',
				year: 2009,
				month: 1,
				day: 1
			},
			end: {
				period: 'month',
				year: 2010,
				month: 2,
				day: 31
			}
		});

		test('2018-01-01 to 2018-01-05', {}, {
			start: {
				period: 'day',
				year: 2018,
				month: 0,
				day: 1
			},
			end: {
				period: 'day',
				year: 2018,
				month: 0,
				day: 5
			}
		});

		test('February to March', { now: new Date(2010, 8, 1) }, {
			start: {
				period: 'month',
				year: 2010,
				month: 1,
				day: 1
			},
			end: {
				period: 'month',
				year: 2010,
				month: 2,
				day: 31
			}
		});

		test('February to March 2009', { now: new Date(2010, 8, 1) }, {
			start: {
				period: 'month',
				year: 2009,
				month: 1,
				day: 1
			},
			end: {
				period: 'month',
				year: 2009,
				month: 2,
				day: 31
			}
		});

		test('2018-05-02', {}, {
			start: {
				period: 'day',
				year: 2018,
				month: 4,
				day: 2
			},
			end: {
				period: 'day',
				year: 2018,
				month: 4,
				day: 2
			}
		});

		test('week 42', { now: new Date(2012, 8, 1) }, {
			start: {
				period: 'week',
				year: 2012,
				month: 9,
				day: 14
			},
			end: {
				period: 'week',
				year: 2012,
				month: 9,
				day: 20
			}
		});

		test('Friday to Tuesday', { now: new Date(2012, 8, 1) }, {
			start: {
				period: 'day',
				year: 2012,
				month: 8,
				day: 7
			},
			end: {
				period: 'day',
				year: 2012,
				month: 8,
				day: 11
			}
		});

		test('January 12th - 15th', { now: new Date(2012, 8, 1) }, {
			start: {
				period: 'day',
				year: 2012,
				month: 0,
				day: 12
			},
			end: {
				period: 'day',
				year: 2012,
				month: 0,
				day: 15
			}
		});

		test('today', { now: new Date(2012, 8, 1) }, {
			start: {
				period: 'day',
				year: 2012,
				month: 8,
				day: 1
			},
			end: {
				period: 'day',
				year: 2012,
				month: 8,
				day: 1
			}
		});

		test('tomorrow', { now: new Date(2012, 8, 1) }, {
			start: {
				period: 'day',
				year: 2012,
				month: 8,
				day: 2
			},
			end: {
				period: 'day',
				year: 2012,
				month: 8,
				day: 2
			}
		});

		test('yesterday', { now: new Date(2012, 8, 3) }, {
			start: {
				period: 'day',
				year: 2012,
				month: 8,
				day: 2
			},
			end: {
				period: 'day',
				year: 2012,
				month: 8,
				day: 2
			}
		});
	});
});
