import { mapDateInterval } from '../src/date-intervals.js';
import { mapDateTime } from '../src/date-times.js';
import { mapDate } from '../src/dates.js';
import { DateTimeData } from '../src/DateTimeData.js';
import { IntervalEdge } from '../src/IntervalEdge.js';
import { Meridiem } from '../src/Meridiem.js';
import { mapTime } from '../src/times.js';
import { TimeRelationship } from '../src/TimeRelationship.js';

/**
 * Map the given data and check that the mapping left it as it was. Data that
 * has been matched is shared and may be mapped more than once, so a mapping
 * that writes back into it would change what a later mapping resolves.
 *
 * @param data -
 *   the data to map
 * @param map -
 *   function performing the mapping
 */
function expectInputIsUnchanged<T>(data: T, map: (data: T) => unknown) {
	const before = structuredClone(data);

	map(data);

	expect(data).toEqual(before);
}

describe('Time', () => {
	describe('Mapping leaves its input unchanged', () => {
		const options = {
			now: new Date(2017, 2, 24, 13, 30)
		};

		it('mapDate with a day', () => {
			expectInputIsUnchanged<DateTimeData>(
				{ day: 5 },
				data => mapDate(data, options)
			);
		});

		it('mapDate with a relative time', () => {
			expectInputIsUnchanged<DateTimeData>(
				{
					day: 5,
					intervalEdge: IntervalEdge.End,
					relativeTo: { year: 2021 }
				},
				data => mapDate(data, options)
			);
		});

		it('mapTime with an hour above twelve', () => {
			expectInputIsUnchanged<DateTimeData>(
				{ hour: 15, meridiem: Meridiem.Auto },
				data => mapTime(data, options)
			);
		});

		it('mapDateTime', () => {
			expectInputIsUnchanged<DateTimeData>(
				{ day: 5, hour: 15, meridiem: Meridiem.Auto },
				data => mapDateTime(data, options)
			);
		});

		it('mapDateInterval with a start and an end', () => {
			expectInputIsUnchanged(
				{
					start: { day: 5 },
					end: { day: 10, year: 2021, month: 3 }
				},
				data => mapDateInterval(data, options)
			);
		});
	});

	describe('Mapping the same data twice', () => {
		const options = {
			now: new Date(2017, 2, 24, 13, 30)
		};

		it('mapDate resolves the same date', () => {
			const data: DateTimeData = {
				day: 5,
				intervalEdge: IntervalEdge.End,
				relativeTo: {
					year: 2021,
					relationToCurrent: TimeRelationship.Past
				}
			};

			expect(mapDate(data, options)).toEqual(mapDate(data, options));
		});

		it('mapDateInterval resolves the same interval when both edges share data', () => {
			// The month graphs map an interval built as `{ start: r, end: r }`
			const shared: DateTimeData = { month: 3 };
			const data = { start: shared, end: shared };

			expect(mapDateInterval(data, options))
				.toEqual(mapDateInterval(data, options));
		});
	});
});
