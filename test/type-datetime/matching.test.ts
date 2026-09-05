import { combine, isRelative, reverse } from '../../src/type-datetime/matching.js';
import { TimeRelationship } from '../../src/type-datetime/TimeRelationship.js';

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

		describe('isRelative()', () => {
			it('is false without relative fields', () => {
				expect(isRelative({ year: 2018, month: 1, day: 2 })).toBe(false);
			});

			it('is true for every relative date field', () => {
				expect(isRelative({ relativeYears: 1 })).toBe(true);
				expect(isRelative({ relativeQuarters: 1 })).toBe(true);
				expect(isRelative({ relativeMonths: 1 })).toBe(true);
				expect(isRelative({ relativeWeeks: 1 })).toBe(true);
				expect(isRelative({ relativeDays: 1 })).toBe(true);
			});

			it('is true for every relative time field', () => {
				expect(isRelative({ relativeHours: 1 })).toBe(true);
				expect(isRelative({ relativeMinutes: 1 })).toBe(true);
				expect(isRelative({ relativeSeconds: 1 })).toBe(true);
				expect(isRelative({ relativeMilliseconds: 1 })).toBe(true);
			});
		});

		describe('reverse()', () => {
			it('negates every relative field', () => {
				expect(reverse({
					relativeYears: 1,
					relativeQuarters: 2,
					relativeMonths: 3,
					relativeWeeks: 4,
					relativeDays: 5,
					relativeHours: 6,
					relativeMinutes: 7,
					relativeSeconds: 8,
					relativeMilliseconds: 9
				})).toEqual({
					relativeYears: -1,
					relativeQuarters: -2,
					relativeMonths: -3,
					relativeWeeks: -4,
					relativeDays: -5,
					relativeHours: -6,
					relativeMinutes: -7,
					relativeSeconds: -8,
					relativeMilliseconds: -9
				});
			});

			it('leaves the given data unchanged', () => {
				const data = { relativeDays: 2, relationToCurrent: TimeRelationship.Past };
				reverse(data);

				expect(data).toEqual({ relativeDays: 2, relationToCurrent: TimeRelationship.Past });
			});
		});
	});
});
