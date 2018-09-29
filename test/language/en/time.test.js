'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../../../language/en');
const time = (text, options) => en.time.match(text, options);

describe('English', function() {

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

		describe('Invalid', function() {
			it('25', function() {
				return time('25')
				.then(v => expect(v).to.equal(null))
			});

			it('25 a.m.', function() {
				return time('25 a.m.')
				.then(v => expect(v).to.equal(null))
			});

			it('10:75.', function() {
				return time('10:75', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal(null)
				)
			});

			it('5 minutes to 25', function() {
				return time('5 minutes to 25', { now: new Date(2010, 0, 1, 13, 30) })
				.then(v =>
					expect(v).to.deep.equal(null)
				)
			});
		})

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

			it('5 minutes', function() {
				return time('5 minutes', { now: new Date(2010, 0, 1, 13, 30) })
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
				return time('18:00 sharp', { now: new Date(2010, 0, 1, 19, 30) })
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

});