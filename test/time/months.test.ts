import { mapMonth } from '../../src/time/months';

describe('Time', () => {
	describe('months', () => {
		describe('mapMonth', () => {
			const e = {
				options: {
					now: new Date(2017, 2, 24)
				}
			};

			it('relativeMonths resolves to current year and month', () => {
				const r = mapMonth({ relativeMonths: 0 }, e);

				expect(r).toEqual({
					period: 'month',
					year: 2017,
					month: 2,
					day: 1
				});
			});

			it('relativeMonths resolves to current year and +2 months', () => {
				const r = mapMonth({ relativeMonths: 2 }, e);

				expect(r).toEqual({
					period: 'month',
					year: 2017,
					month: 4,
					day: 1
				});
			});

			it('relativeMonths resolves to current year and -2 months', () => {
				const r = mapMonth({ relativeMonths: -2 }, e);

				expect(r).toEqual({
					period: 'month',
					year: 2017,
					month: 0,
					day: 1
				});
			});

			it('relativeMonths resolves to previous year', () => {
				const r = mapMonth({ relativeMonths: -4 }, e);

				expect(r).toEqual({
					period: 'month',
					year: 2016,
					month: 10,
					day: 1
				});
			});

			it('Absolute month', () => {
				const r = mapMonth({ month: 5 }, e);

				expect(r).toEqual({
					period: 'month',
					year: 2017,
					month: 5,
					day: 1
				});
			});
		});
	});
});
