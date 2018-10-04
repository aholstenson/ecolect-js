'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../../../language/en');
const dateInterval = (text, options) => en.dateInterval.match(text, options);

function test(expr, opts, v) {
	it(expr + ' [' + (opts.now ? opts.now.toString() : 'current time') + ']', () => {
		return dateInterval(expr, opts)
			.then(r => {
				expect(r).to.deep.equal(v);
			});
	});
}

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

		test('2018-05-01', {}, {
			start: {
				period: 'day',
				year: 2018,
				month: 4,
				day: 1
			},
			end: {
				period: 'day',
				year: 2018,
				month: 4,
				day: 1
			}
		});

	});
});
