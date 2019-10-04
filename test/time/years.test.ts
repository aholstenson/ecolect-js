import { mapYear } from '../../src/time/years';

describe('Time', () => {
	describe('years', () => {
		describe('map', () => {
			const e = {
				options: {
					now: new Date(2017, 2, 24)
				}
			};

			it('relativeYears resolves to current year', () => {
				const r = mapYear({ relativeYears: 0 }, e);

				expect(r).toEqual({
					year: 2017
				});
			});

			it('relativeYears resolves positive years', () => {
				const r = mapYear({ relativeYears: 2 }, e);

				expect(r).toEqual({
					year: 2019
				});
			});

			it('relativeYears resolves negative years', () => {
				const r = mapYear({ relativeYears: -2 }, e);

				expect(r).toEqual({
					year: 2015
				});
			});

			it('Absolute year', () => {
				const r = mapYear({ year: 2015 }, e);

				expect(r).toEqual({
					year: 2015
				});
			});
		});

	});
});
