import { mapDateInterval } from '@ecolect/type-datetime';

import { dateIntervalGraph } from '../src/dateIntervalGraph';
import { EnglishLanguage } from '../src/EnglishLanguage';

import { testRunner } from './helpers';

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
	});
});
