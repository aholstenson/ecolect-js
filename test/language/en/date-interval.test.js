'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../../../language/en');
const dateInterval = (text, options) => en.dateInterval.match(text, options);

function test(expr, opts, v) {
	it(expr, () => {
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

		/*
		test('February to March', { now: new Date(2010, 2, 1) }, {
			start: {
				period: 'year',
				year: 2010,
				month: 1,
				day: 1
			},
			end: {
				period: 'year',
				year: 2010,
				month: 2,
				day: 31
			}
		});
		*/

	});
});
