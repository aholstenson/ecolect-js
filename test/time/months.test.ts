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
					month: 3
				});
			});

			it('relativeMonths resolves to current year and +2 months', () => {
				const r = mapMonth({ relativeMonths: 2 }, e);

				expect(r).toEqual({
					month: 5
				});
			});

			it('relativeMonths resolves to current year and -2 months', () => {
				const r = mapMonth({ relativeMonths: -2 }, e);

				expect(r).toEqual({
					month: 1
				});
			});

			it('relativeMonths resolves to previous year', () => {
				const r = mapMonth({ relativeMonths: -4 }, e);

				expect(r).toEqual({
					month: 11
				});
			});

			it('Absolute month', () => {
				const r = mapMonth({ month: 5 }, e);

				expect(r).toEqual({
					month: 6
				});
			});
		});
	});
});
