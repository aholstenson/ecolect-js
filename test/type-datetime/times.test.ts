import { Meridiem } from '../../src/type-datetime/Meridiem.js';
import { time12h, time24h, mapTime, toAM, toPM } from '../../src/type-datetime/times.js';

describe('Time', () => {
	describe('times', () => {
		describe('toAM and toPM', () => {
			/*
			 * The data given to these is shared with other parses of the same
			 * tokens, so it must be left as it is.
			 */
			it('toPM leaves the given time as it is', () => {
				const time = { hour: 8, meridiem: Meridiem.Auto };
				const r = toPM(time);

				expect(r).toEqual({ hour: 8, meridiem: Meridiem.Pm });
				expect(time).toEqual({ hour: 8, meridiem: Meridiem.Auto });
			});

			it('toAM leaves the given time as it is', () => {
				const time = { hour: 8, meridiem: Meridiem.Auto };
				const r = toAM(time);

				expect(r).toEqual({ hour: 8, meridiem: Meridiem.Am });
				expect(time).toEqual({ hour: 8, meridiem: Meridiem.Auto });
			});
		});

		describe('time12h', () => {
			it('Full time', () => {
				const r = time12h(8, 12, 42);
				expect(r).toEqual({
					hour: 8,
					minute: 12,
					second: 42,
					meridiem: 'auto'
				});
			});

			it('Hour + minute', () => {
				const r = time12h(8, 12);
				expect(r).toEqual({
					hour: 8,
					minute: 12,
					second: undefined,
					meridiem: 'auto'
				});
			});

			it('Hour', () => {
				const r = time12h(8);
				expect(r).toEqual({
					hour: 8,
					minute: undefined,
					second: undefined,
					meridiem: 'auto'
				});
			});

			it('Hour 0 has fixed meridiem', () => {
				const r = time12h(0, 12, 42);
				expect(r).toEqual({
					hour: 0,
					minute: 12,
					second: 42,
					meridiem: 'fixed'
				});
			});

			it('Hour > 12 has fixed meridiem', () => {
				const r = time12h(13, 12, 42);
				expect(r).toEqual({
					hour: 13,
					minute: 12,
					second: 42,
					meridiem: 'fixed'
				});
			});
		});

		describe('time24h', () => {
			it('Full time', () => {
				const r = time24h(8, 12, 42);
				expect(r).toEqual({
					hour: 8,
					minute: 12,
					second: 42,
					meridiem: 'fixed'
				});
			});

			it('Hour + minute', () => {
				const r = time24h(8, 12);
				expect(r).toEqual({
					hour: 8,
					minute: 12,
					second: undefined,
					meridiem: 'fixed'
				});
			});

			it('Hour', () => {
				const r = time24h(8);
				expect(r).toEqual({
					hour: 8,
					minute: undefined,
					second: undefined,
					meridiem: 'fixed'
				});
			});

			it('Hour > 12', () => {
				const r = time24h(13, 12, 42);
				expect(r).toEqual({
					hour: 13,
					minute: 12,
					second: 42,
					meridiem: 'fixed'
				});
			});
		});

		describe('map', () => {
			const defaultOptions = {
				now: new Date(2010, 1, 6, 10, 0)
			};

			it('Hour 14 with fixed meridiem', () => {
				const r = mapTime({ hour: 15, meridiem: Meridiem.Fixed }, defaultOptions);

				expect(r).toEqual({
					hour: 15,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 8 with fixed meridiem', () => {
				const r = mapTime({ hour: 8, meridiem: Meridiem.Fixed }, defaultOptions);

				expect(r).toEqual({
					hour: 8,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 8 with am meridiem', () => {
				const r = mapTime({ hour: 8, meridiem: Meridiem.Am }, defaultOptions);

				expect(r).toEqual({
					hour: 8,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 12 with am meridiem', () => {
				const r = mapTime({ hour: 12, meridiem: Meridiem.Am }, defaultOptions);

				expect(r).toEqual({
					hour: 0,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 8 with pm meridiem', () => {
				const r = mapTime({ hour: 8, meridiem: Meridiem.Pm }, defaultOptions);

				expect(r).toEqual({
					hour: 20,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 12 with pm meridiem', () => {
				const r = mapTime({ hour: 12, meridiem: Meridiem.Pm }, defaultOptions);

				expect(r).toEqual({
					hour: 12,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 8 with auto meridiem - before now', () => {
				const options = {
					now: new Date(2010, 1, 6, 10, 0)
				};
				const r = mapTime({ hour: 8, meridiem: Meridiem.Auto }, options);

				expect(r).toEqual({
					hour: 20,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 8 with auto meridiem - after now, am', () => {
				const options = {
					now: new Date(2010, 1, 6, 4, 0)
				};
				const r = mapTime({ hour: 8, meridiem: Meridiem.Auto }, options);

				expect(r).toEqual({
					hour: 8,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 8 with auto meridiem - after now, pm', () => {
				const options = {
					now: new Date(2010, 1, 6, 16, 0)
				};
				const r = mapTime({ hour: 8, meridiem: Meridiem.Auto }, options);

				expect(r).toEqual({
					hour: 20,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 12 with auto meridiem - after now, am', () => {
				const options = {
					now: new Date(2010, 1, 6, 4, 0)
				};
				const r = mapTime({ hour: 12, meridiem: Meridiem.Auto }, options);

				expect(r).toEqual({
					hour: 12,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 12 with auto meridiem - after now, pm', () => {
				const options = {
					now: new Date(2010, 1, 6, 16, 0)
				};
				const r = mapTime({ hour: 12, meridiem: Meridiem.Auto }, options);

				expect(r).toEqual({
					hour: 0,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});
		});
	});
});
