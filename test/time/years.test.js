const chai = require('chai');
const expect = chai.expect;

const { map } = require('../../time/years');

describe('Time', () => {
	describe('years', () => {
		describe('map', () => {
			const e = {
				options: {
					now: new Date(2017, 2, 24)
				}
			};

			it('relativeYears resolves to current year', () => {
				const r = map({ relativeYears: 0 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2017,
					month: 0,
					day: 1
				});
			});

			it('relativeYears resolves positive years', () => {
				const r = map({ relativeYears: 2 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2019,
					month: 0,
					day: 1
				});
			});

			it('relativeYears resolves negative years', () => {
				const r = map({ relativeYears: -2 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2015,
					month: 0,
					day: 1
				});
			});

			it('Absolute year', () => {
				const r = map({ year: 2015 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2015,
					month: 0,
					day: 1
				});
			});
		});

	});
});
