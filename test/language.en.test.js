'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../language/en');
const integer = text => en.integer.match(text);
const number = text => en.number.match(text);
const ordinal = text => en.ordinal.match(text);
const temperature = (text, options) => en.temperature.match(text, options);
const dayOfWeek = (text, options) => en.dayOfWeek.match(text, options);
const month = (text, options) => en.month.match(text, options);
const year = (text, options) => en.year.match(text, options);
const date = (text, options) => en.date.match(text, options);
const time = (text, options) => en.time.match(text, options);
const datetime = (text, options) => en.datetime.match(text, options);

describe('English', function() {
	describe('Tokenization', function() {
		it('Simple: Hello World', function() {
			const tokens = en.tokenize('hello world');
			expect(tokens.length).to.equal(2);
			expect(tokens[0].raw).to.equal('hello');
			expect(tokens[1].raw).to.equal('world');
		});

		it('Contraction: Wasn\'t', function() {
			const tokens = en.tokenize('Wasn\'t');
			expect(tokens.length).to.equal(2);
			expect(tokens[0].normalized).to.equal('was');
			expect(tokens[1].normalized).to.equal('not');
		});

		it('Contraction: Can\'t', function() {
			const tokens = en.tokenize('Can\'t');
			expect(tokens.length).to.equal(2);
			expect(tokens[0].normalized).to.equal('can');
			expect(tokens[1].normalized).to.equal('not');
		});

		it('Contraction: I\'m', function() {
			const tokens = en.tokenize('I\'m');
			expect(tokens.length).to.equal(2);
			expect(tokens[0].normalized).to.equal('i');
			expect(tokens[1].normalized).to.equal('am');
		});

		it('Contraction: You\'re', function() {
			const tokens = en.tokenize('You\'re');
			expect(tokens.length).to.equal(2);
			expect(tokens[0].normalized).to.equal('you');
			expect(tokens[1].normalized).to.equal('are');
		});

		it('Contraction: They\'ll', function() {
			const tokens = en.tokenize('They\'ll');
			expect(tokens.length).to.equal(2);
			expect(tokens[0].normalized).to.equal('they');
			expect(tokens[1].normalized).to.equal('will');
		});
	});

	describe('Integer', function() {
		it('one', function() {
			return integer('one')
				.then(v =>
					expect(v).to.deep.equal({ value: 1 })
				);
		});

		it('1', function() {
			return integer('1')
				.then(v =>
					expect(v).to.deep.equal({ value: 1 })
				);
		});

		it('1 4', function() {
			return integer('1 4')
				.then(v =>
					expect(v).to.deep.equal({ value: 14 })
				);
		});

		it('thousand', function() {
			return integer('thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000 })
				);
		});

		it('one thousand', function() {
			return integer('one thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000 })
				);
		});

		it('1 thousand', function() {
			return integer('1 thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000 })
				);
		});

		it('1 400', function() {
			return integer('1 400')
				.then(v =>
					expect(v).to.deep.equal({ value: 1400 })
				);
		});

		it('two dozen', function() {
			return integer('two dozen')
				.then(v =>
					expect(v).to.deep.equal({ value: 24 })
				);
		});

		it('100k', function() {
			return integer('100k')
				.then(v =>
					expect(v).to.deep.equal({ value: 100000 })
				);
		});

		it('-100', function() {
			return integer('-100')
				.then(v =>
					expect(v).to.equal(null)
				);
		});

		it('-1 000', function() {
			return integer('-1 000')
				.then(v =>
					expect(v).to.equal(null)
				);
		});

		it('minus one million', function() {
			return integer('minus one million')
				.then(v =>
					expect(v).to.equal(null)
				);
		});

		it('1 thousand thousand', function() {
			return integer('1 thousand thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000000 })
				);
		});

		it('one 000', function() {
			return integer('one 000')
				.then(v =>
					expect(v).to.deep.equal({ value: 1 })
				);
		});
	});

	describe('Numbers', function() {
		it('one', function() {
			return number('one')
				.then(v =>
					expect(v).to.deep.equal({ value: 1 })
				);
		});

		it('1', function() {
			return number('1')
				.then(v =>
					expect(v).to.deep.equal({ value: 1 })
				);
		});

		it('1.4', function() {
			return number('1.4')
				.then(v =>
					expect(v).to.deep.equal({ value: 1.4 })
				);
		});

		it('1 4', function() {
			return number('1 4')
				.then(v =>
					expect(v).to.deep.equal({ value: 14 })
				);
		});

		it('thousand', function() {
			return number('thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000 })
				);
		});

		it('one thousand', function() {
			return number('one thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000 })
				);
		});

		it('1 thousand', function() {
			return number('1 thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000 })
				);
		});

		it('1.2 thousand', function() {
			return number('1.2 thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1200 })
				);
		});

		it('1 400', function() {
			return number('1 400')
				.then(v =>
					expect(v).to.deep.equal({ value: 1400 })
				);
		});

		it('two dozen', function() {
			return number('two dozen')
				.then(v =>
					expect(v).to.deep.equal({ value: 24 })
				);
		});

		it('100k', function() {
			return number('100k')
				.then(v =>
					expect(v).to.deep.equal({ value: 100000 })
				);
		});

		it('-100', function() {
			return number('-100')
				.then(v =>
					expect(v).to.deep.equal({ value: -100 })
				);
		});

		it('-1 000', function() {
			return number('-1 000')
				.then(v =>
					expect(v).to.deep.equal({ value: -1000 })
				);
		});

		it('minus one million', function() {
			return number('minus one million')
				.then(v =>
					expect(v).to.deep.equal({ value: -1000000 })
				);
		});

		it('1 thousand thousand', function() {
			return number('1 thousand thousand')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000000 })
				);
		});

		it('1e3', function() {
			return number('1e3')
				.then(v =>
					expect(v).to.deep.equal({ value: 1000 })
				);
		});

		it('1e-3', function() {
			return number('1e-3')
				.then(v =>
					expect(v).to.deep.equal({ value: 0.001 })
				);
		});
	});

	describe('Ordinal', function() {
		it('one', function() {
			return ordinal('one')
				.then(v =>
					expect(v).to.deep.equal({ value: 1 })
				);
		});

		it('1st', function() {
			return ordinal('1st')
				.then(v =>
					expect(v).to.deep.equal({ value: 1 })
				);
		});

		it('2 1st', function() {
			return ordinal('2 1st')
				.then(v =>
					expect(v).to.deep.equal({ value: 21 })
				);
		});

		it('stuff st', function() {
			return ordinal('stuff st')
				.then(v =>
					expect(v).to.deep.equal(null)
				);
		});
	});

	describe('Temperature', function() {
		it('one', function() {
			return temperature('one')
				.then(v =>
					expect(v).to.deep.equal({ value: 1, unit: 'unknown' })
				);
		});

		it('one degree', function() {
			return temperature('one degree')
				.then(v =>
					expect(v).to.deep.equal({ value: 1, unit: 'unknown' })
				);
		});

		it('one degree (default unit)', function() {
			return temperature('one degree', {
				temperature: 'celsius'
			})
				.then(v =>
					expect(v).to.deep.equal({ value: 1, unit: 'celsius' })
				);
		});

		it('40 F', function() {
			return temperature('40 F')
				.then(v =>
					expect(v).to.deep.equal({ value: 40, unit: 'fahrenheit' })
				);
		});

		it('40 fahrenheit', function() {
			return temperature('40 F')
				.then(v =>
					expect(v).to.deep.equal({ value: 40, unit: 'fahrenheit' })
				);
		});

		it('40 C', function() {
			return temperature('40 C')
				.then(v =>
					expect(v).to.deep.equal({ value: 40, unit: 'celsius' })
				);
		});

		it('40 celsius', function() {
			return temperature('40 celsius')
				.then(v =>
					expect(v).to.deep.equal({ value: 40, unit: 'celsius' })
				);
		});
	});

	describe('Day of Week', function() {
		it('Friday', function() {
			return dayOfWeek('Friday')
				.then(v =>
					expect(v).to.deep.equal({ value: 5 })
				);
		});

		it('Tue', function() {
			return dayOfWeek('Tue')
				.then(v =>
					expect(v).to.deep.equal({ value: 2 })
				);
		});

		it('on Tue', function() {
			return dayOfWeek('Tue')
				.then(v =>
					expect(v).to.deep.equal({ value: 2 })
				);
		});
	});

	describe('Month', function() {
		it('jan', function() {
			return month('jan')
				.then(v =>
					expect(v).to.deep.equal({ month: 0 })
				);
		});

		it('this month', function() {
			const now = new Date(2010, 0, 1);
			return month('this month', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						year: 2010,
						month: 0
					})
				);
		});

		it('next month', function() {
			const now = new Date(2010, 0, 1);
			return month('next month', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						year: 2010,
						month: 1
					})
				);
		});

		it('last month', function() {
			const now = new Date(2010, 0, 1);
			return month('last month', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						year: 2009,
						month: 11
					})
				);
		});

		it('in one month', function() {
			const now = new Date(2010, 0, 1);
			return month('in one month', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						year: 2010,
						month: 1
					})
				);
		});

		it('in 4 months', function() {
			const now = new Date(2010, 0, 1);
			return month('in 4 months', { now: now })
				.then(v =>
					expect(v).to.deep.equal({
						year: 2010,
						month: 4
					})
				);
		});
	});

	describe('Year', function() {
		it('2018', function() {
			return year('2018')
				.then(v =>
					expect(v).to.deep.equal({ year: 2018 })
				);
		});

		it('this year', function() {
			return year('this year')
				.then(v =>
					expect(v).to.deep.equal({ year: new Date().getFullYear() })
				);
		});

		it('in 4 years', function() {
			return year('in 4 years', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2014, month: 0 })
				);
		});
	});

	describe('Date', function() {
		describe('Weekdays', function() {
			it('this tuesday', function() {
				const now = new Date(2017, 0, 24);
				return date('this tuesday', { now: now })
					.then(v =>
						expect(v).to.deep.equal({
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
							year: 2017,
							month: 0,
							day: 30
						})
					);
			});
		});

		describe('Month + day', function() {
			it('jan 12', function() {
				const now = new Date(2017, 0, 24);
				return date('jan 12', { now: now })
				.then(v =>
					expect(v).to.deep.equal({ year: 2017, month: 0, day: 12 })
				);
			});

			it('12 jan', function() {
				const now = new Date(2017, 0, 24);
				return date('12 jan', { now: now })
				.then(v =>
					expect(v).to.deep.equal({ year: 2017, month: 0, day: 12 })
				);
			});

			it('12th november', function() {
				const now = new Date(2017, 0, 24);
				return date('12th november', { now: now })
				.then(v =>
					expect(v).to.deep.equal({ year: 2017, month: 10, day: 12 })
				);
			});

			it('12th of november', function() {
				const now = new Date(2017, 0, 24);
				return date('12th of november', { now: now })
				.then(v =>
					expect(v).to.deep.equal({ year: 2017, month: 10, day: 12 })
				);
			});

			it('4/12', function() {
				const now = new Date(2017, 0, 24);
				return date('4/12', { now: now })
				.then(v =>
					expect(v).to.deep.equal({ year: 2017, month: 3, day: 12 })
				);
			});
		});

		describe('Relative day of week in month', function() {
			it('first Friday May', function() {
				return date('first Friday May', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2010, month: 4, day: 7 })
				);
			});

			it('first Friday in May', function() {
				return date('first Friday in May', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2010, month: 4, day: 7 })
				);
			});

			it('3rd Friday in May', function() {
				return date('3rd Friday in May', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2010, month: 4, day: 21 })
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
					expect(v).to.deep.equal({ year: 2018, month: 0, day: 12 })
				);
			});

			it('12 jan, 2018', function() {
				return date('12 jan, 2018')
				.then(v =>
					expect(v).to.deep.equal({ year: 2018, month: 0, day: 12 })
				);
			});

			it('12 jan in 2018', function() {
				return date('12 jan in 2018')
				.then(v =>
					expect(v).to.deep.equal({ year: 2018, month: 0, day: 12 })
				);
			});

			it('12 jan in 4 years', function() {
				return date('12 jan in 4 years', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2014, month: 0, day: 12 })
				);
			});

			it('2010 01 01', function() {
				return date('2010 01 01')
				.then(v => {
					expect(v).to.deep.equal({
						year: 2010,
						month: 0,
						day: 1
					})
				});
			});

			it('2010-01-01', function() {
				return date('2010-01-01')
				.then(v => {
					expect(v).to.deep.equal({
						year: 2010,
						month: 0,
						day: 1
					})
				});
			});

			it('01 02 2010', function() {
				return date('01 02 2010')
				.then(v => {
					expect(v).to.deep.equal({
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
						year: 2010,
						month: 0,
						day: 2
					})
				});
			});

			it('today', function() {
				return date('today', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2010, month: 0, day: 1 })
				);
			});

			it('tomorrow', function() {
				return date('tomorrow', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2010, month: 0, day: 2 })
				);
			});

			it('yesterday', function() {
				return date('yesterday', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2009, month: 11, day: 31 })
				);
			});

			it('day after tomorrow', function() {
				return date('day after tomorrow', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2010, month: 0, day: 3 })
				);
			});

			it('in 1 day', function() {
				return date('in 1 day', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2010, month: 0, day: 2 })
				);
			});

			it('in 3 days', function() {
				return date('in 3 days', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2010, month: 0, day: 4 })
				);
			});

			it('in 2 months and 3 days', function() {
				return date('in 2 months and 3 days', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2010, month: 2, day: 4 })
				);
			});

			it('in 1 week', function() {
				return date('in 1 week', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2010, month: 0, day: 8 })
				);
			});

			it('in two weeks', function() {
				return date('in 2 weeks', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2010, month: 0, day: 15 })
				);
			});

			it('2nd this month', function() {
				return date('2nd this month', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2010, month: 0, day: 2 })
				);
			});

			it('the 2nd of this month', function() {
				return date('the 2nd this month', { now: new Date(2010, 0, 1) })
				.then(v =>
					expect(v).to.deep.equal({ year: 2010, month: 0, day: 2 })
				);
			});
		});

		describe('Relative dates within year', function() {
			it('12 jan next year', function() {
				return date('12 jan next year')
				.then(v =>
					expect(v).to.deep.equal({
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
						year: 2018,
						month: 0,
						day: 5
					})
				);
			});

			it('first friday in may 2018', function() {
				return date('first friday in may 2018')
				.then(v =>
					expect(v).to.deep.equal({
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
						year: 2018,
						month: 4,
						day: 4
					})
				);
			});
		});
	});

	describe('Time', function() {
		describe('Exactish', function() {
			it('00:00', function() {
				return time('00:00', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 0,
						minute: 0,
						second: 0,
						precision: 'normal'
					})
				);
			});

			it('00 00', function() {
				return time('00:00', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 0,
						minute: 0,
						second: 0,
						precision: 'normal'
					})
				);
			});

			it('330 (local 13:30)', function() {
				return time('330', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 15,
						minute: 30,
						second: 0,
						precision: 'normal'
					})
				);
			});

			it('330 (local 2:30)', function() {
				return time('330', { now: new Date(2010, 0, 1, 2, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 3,
						minute: 30,
						second: 0,
						precision: 'normal'
					})
				);
			});

			it('3:30', function() {
				return time('3:30', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 15,
						minute: 30,
						second: 0,
						precision: 'normal'
					})
				);
			});

			// TODO: Activate this test when integer parsing is updated
			/*
			it('three thirty', function() {
				return time('three thirty')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 3,
						minute: 30,
						precision: 'normal'
					})
				);
			});
			*/

			it('3:30 PM', function() {
				return time('3:30 PM', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 15,
						minute: 30,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('3:30 p.m.', function() {
				return time('3:30 p.m.', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 15,
						minute: 30,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('3 a.m.', function() {
				return time('3 a.m.')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 3,
						minute: 0,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('3 am', function() {
				return time('3 am')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 3,
						minute: 0,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('12 a.m.', function() {
				return time('12 a.m.')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 0,
						minute: 0,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('20 a.m.', function() {
				return time('20 a.m.')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 8,
						minute: 0,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('7 p.m.', function() {
				return time('7 p.m.')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 19,
						minute: 0,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('12 p.m.', function() {
				return time('12 p.m.')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 12,
						minute: 0,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('22 p.m.', function() {
				return time('22 p.m.')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 22,
						minute: 0,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('at 3', function() {
				return time('at 3', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 15,
						minute: 0,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('11:12:13', function() {
				return time('11:12:13', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 23,
						minute: 12,
						second: 13,
						precision: 'normal'
					})
				)
			});
		});

		describe('Expressive', function() {

			it('quarter to twelve', function() {
				return time('quarter to twelve', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 23,
						minute: 45,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('15 before 12', function() {
				return time('15 before 12', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 23,
						minute: 45,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('half before 12', function() {
				return time('half before 12', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 23,
						minute: 30,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('3 quarters til 12', function() {
				return time('3 quarters til 12', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 23,
						minute: 15,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('15 minutes before 3 pm', function() {
				return time('15 minutes before 3 pm')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 14,
						minute: 45,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('half past twelve', function() {
				return time('half past twelve', { now: new Date(2010, 0, 1, 10, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 12,
						minute: 30,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('half twelve', function() {
				return time('half twelve', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 0,
						minute: 30,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('midnight', function() {
				return time('midnight')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 0,
						minute: 0,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('noon', function() {
				return time('noon')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 12,
						minute: 0,
						second: 0,
						precision: 'normal'
					})
				)
			});

			it('5 minutes to midnight', function() {
				return time('5 minutes to midnight')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 23,
						minute: 55,
						second: 0,
						precision: 'normal'
					})
				)
			});
		});

		/*
		describe('Timezones', function() {
			it('04:00 EST', function() {
				return time('04:00 EST')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 4,
						minute: 0,
						precision: 'normal'
					})
				)
			});
		});
		*/

		describe('Relative', function() {
			it('in 4 hours', function() {
				return time('in 4 hours', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 17,
						minute: 30,
						second: 0,
						precision: 'normal'
					})
				);
			});

			it('in 5 minutes', function() {
				return time('in 5 minutes', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 13,
						minute: 35,
						second: 0,
						precision: 'normal'
					})
				);
			});

			it('in 4 hours 10 minutes', function() {
				return time('in 4 hours 10 minutes', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 17,
						minute: 40,
						second: 0,
						precision: 'normal'
					})
				);
			});

			it('in 4 hours and 10 minutes', function() {
				return time('in 4 hours and 10 minutes', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 17,
						minute: 40,
						second: 0,
						precision: 'normal'
					})
				);
			});

			it('in 45 minutes', function() {
				return time('in 45 minutes', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 14,
						minute: 15,
						second: 0,
						precision: 'normal'
					})
				);
			});

			it('at in 4 hours', function() {
				return time('at in 4 hours', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 17,
						minute: 30,
						second: 0,
						precision: 'normal'
					})
				);
			});
		});

		describe('Precision', function() {
			it('7 ish', function() {
				return time('7 ish', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 19,
						minute: 0,
						second: 0,
						precision: 'approximate'
					})
				);
			});

			it('7 pm ish', function() {
				return time('7 pm ish', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 19,
						minute: 0,
						second: 0,
						precision: 'approximate'
					})
				);
			});

			it('7 amish', function() {
				return time('7 amish', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 7,
						minute: 0,
						second: 0,
						precision: 'approximate'
					})
				);
			});

			it('7 pmish', function() {
				return time('7 pmish', { now: new Date(2010, 0, 1, 5, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 19,
						minute: 0,
						second: 0,
						precision: 'approximate'
					})
				);
			});

			it('08:15 approximately', function() {
				return time('08:15 approximately', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 20,
						minute: 15,
						second: 0,
						precision: 'approximate'
					})
				);
			});

			it('around 7', function() {
				return time('around 7', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 19,
						minute: 0,
						second: 0,
						precision: 'approximate'
					})
				);
			});

			it('exactly 7 a.m.', function() {
				return time('exactly 7 a.m.', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal({
						hour: 7,
						minute: 0,
						second: 0,
						precision: 'exact'
					})
				);
			});

			it('18:00 sharp', function() {
				return time('18:00 sharp')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 18,
						minute: 0,
						second: 0,
						precision: 'exact'
					})
				);
			});

			it('7 p.m. sharp', function() {
				return time('7 p.m. sharp')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 19,
						minute: 0,
						second: 0,
						precision: 'exact'
					})
				);
			});

			it('7 a.m. sharp', function() {
				return time('7 a.m. sharp')
				.then(v =>
					expect(v).to.deep.equal({
						hour: 7,
						minute: 0,
						second: 0,
						precision: 'exact'
					})
				);
			});
		});
	});

	describe('Date & Time', function() {
		it('12:10, jan 12th', function() {
			return datetime('12:10, jan 12th', { now: new Date(2010, 0, 1, 13, 30) })
			.then(v =>
				expect(v).to.deep.equal({
					year: 2010,
					month: 0,
					day: 12,
					hour: 12,
					minute: 10,
					second: 0,
					precision: 'normal'
				})
			);
		});

		it('jan 12th 12:10', function() {
			return datetime('jan 12th 12:10', { now: new Date(2010, 0, 1, 13, 30) })
			.then(v =>
				expect(v).to.deep.equal({
					year: 2010,
					month: 0,
					day: 12,
					hour: 12,
					minute: 10,
					second: 0,
					precision: 'normal'
				})
			);
		});

		it('on jan 12th at 12:10', function() {
			return datetime('on jan 12th at 12:10', { now: new Date(2010, 0, 1, 13, 30) })
			.then(v =>
				expect(v).to.deep.equal({
					year: 2010,
					month: 0,
					day: 12,
					hour: 12,
					minute: 10,
					second: 0,
					precision: 'normal'
				})
			);
		});

		it('14:15', function() {
			return datetime('14:15', { now: new Date(2010, 0, 1, 13, 30) })
			.then(v =>
				expect(v).to.deep.equal({
					year: 2010,
					month: 0,
					day: 1,
					hour: 14,
					minute: 15,
					second: 0,
					precision: 'normal'
				})
			);
		});

		it('in 2 days', function() {
			return datetime('in 2 days', { now: new Date(2010, 0, 1, 13, 30) })
			.then(v =>
				expect(v).to.deep.equal({
					year: 2010,
					month: 0,
					day: 3,
					hour: 13,
					minute: 30,
					second: 0,
					precision: 'normal'
				})
			);
		});

		it('in 2 days and 2 hours', function() {
			return datetime('in 2 days and 2 hours', { now: new Date(2010, 0, 1, 13, 30) })
			.then(v =>
				expect(v).to.deep.equal({
					year: 2010,
					month: 0,
					day: 3,
					hour: 15,
					minute: 30,
					second: 0,
					precision: 'normal'
				})
			);
		});

		it('in 2 months and 2 days', function() {
			return datetime('in 2 months and 2 days', { now: new Date(2010, 0, 1, 13, 30) })
			.then(v =>
				expect(v).to.deep.equal({
					year: 2010,
					month: 2,
					day: 3,
					hour: 13,
					minute: 30,
					second: 0,
					precision: 'normal'
				})
			);
		});
	});
});
