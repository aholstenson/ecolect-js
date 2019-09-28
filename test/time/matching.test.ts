import { combine } from '../../src/time/matching';

describe('Time', () => {
	describe('matching', () => {
		describe('combine()', () => {
			it('No keys in B', () => {
				const a = { year: 2018 };
				const b = { };

				const r = combine(a, b);

				expect(r).toEqual({
					year: 2018
				});
			});

			it('Keys in B copied to A', () => {
				const a = { year: 2018 };
				const b = { month: 1 };

				const r = combine(a, b);

				expect(r).toEqual({
					year: 2018,
					month: 1
				});
			});

			it('Keys in B overwrite keys in A', () => {
				const a = { year: 2018 };
				const b = { year: 2019 };

				const r = combine(a, b);

				expect(r).toEqual({
					year: 2019
				});
			});
		});
	});
});
