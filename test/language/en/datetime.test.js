'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../../../language/en');
const datetime = (text, options) => en.datetime.match(text, options);

describe('English', function() {


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

		it('14:10, today', function() {
			return datetime('14:10, today', { now: new Date(2010, 0, 1, 13, 30) })
			.then(v =>
				expect(v).to.deep.equal({
					year: 2010,
					month: 0,
					day: 1,
					hour: 14,
					minute: 10,
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

		it('in 5 hours', function() {
			return datetime('in 5 hours', { now: new Date(2010, 0, 1, 13, 30) })
			.then(v =>
				expect(v).to.deep.equal({
					year: 2010,
					month: 0,
					day: 1,
					hour: 18,
					minute: 30,
					second: 0,
					precision: 'normal'
				})
			);
		});

		it('in 2 days and 3 hours', function() {
			return datetime('in 2 days and 3 hours', { now: new Date(2010, 0, 1, 13, 30) })
			.then(v =>
				expect(v).to.deep.equal({
					year: 2010,
					month: 0,
					day: 3,
					hour: 16,
					minute: 30,
					second: 0,
					precision: 'normal'
				})
			);
		});

		it('in 3 hours and 2 days', function() {
			return datetime('in 3 hours and 2 days', { now: new Date(2010, 0, 1, 13, 30) })
			.then(v =>
				expect(v).to.deep.equal({
					year: 2010,
					month: 0,
					day: 3,
					hour: 16,
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
