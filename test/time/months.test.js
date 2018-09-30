const chai = require('chai');
const expect = chai.expect;

const { map } = require('../../time/months');

describe('Time', () => {
	describe('months', () => {
		describe('map', () => {
			const e = {
				options: {
					now: new Date(2017, 2, 24)
				}
			};

			it('relativeMonths resolves to current year and month', () => {
				const r = map({ relativeMonths: 0 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 2,
					day: 1
				});
			});

			it('relativeMonths resolves to current year and +2 months', () => {
				const r = map({ relativeMonths: 2 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 4,
					day: 1
				});
			});

			it('relativeMonths resolves to current year and -2 months', () => {
				const r = map({ relativeMonths: -2 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 0,
					day: 1
				});
			});

			it('relativeMonths resolves to previous year', () => {
				const r = map({ relativeMonths: -4 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2016,
					month: 10,
					day: 1
				});
			});

			it('Absolute month', () => {
				const r = map({ month: 5 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 5,
					day: 1
				});
			});
		});
	});
});
