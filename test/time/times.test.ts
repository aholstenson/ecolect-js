import { time12h, time24h, mapTime } from '../../src/time/times';
import { Meridiem } from '../../src/time/Meridiem';

describe('Time', () => {
	describe('times', () => {
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
			const defaultE = {
				options: {
					now: new Date(2010, 1, 6, 10, 0)
				}
			};

			it('Hour 14 with fixed meridiem', () => {
				const r = mapTime({ hour: 15, meridiem: Meridiem.Fixed }, defaultE);

				expect(r).toEqual({
					hour: 15,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 8 with fixed meridiem', () => {
				const r = mapTime({ hour: 8, meridiem: Meridiem.Fixed }, defaultE);

				expect(r).toEqual({
					hour: 8,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 8 with am meridiem', () => {
				const r = mapTime({ hour: 8, meridiem: Meridiem.Am }, defaultE);

				expect(r).toEqual({
					hour: 8,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 12 with am meridiem', () => {
				const r = mapTime({ hour: 12, meridiem: Meridiem.Am }, defaultE);

				expect(r).toEqual({
					hour: 0,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 8 with pm meridiem', () => {
				const r = mapTime({ hour: 8, meridiem: Meridiem.Pm }, defaultE);

				expect(r).toEqual({
					hour: 20,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 12 with pm meridiem', () => {
				const r = mapTime({ hour: 12, meridiem: Meridiem.Pm }, defaultE);

				expect(r).toEqual({
					hour: 12,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 8 with auto meridiem - before now', () => {
				const e = {
					options: {
						now: new Date(2010, 1, 6, 10, 0)
					}
				};
				const r = mapTime({ hour: 8, meridiem: Meridiem.Auto }, e);

				expect(r).toEqual({
					hour: 20,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 8 with auto meridiem - after now, am', () => {
				const e = {
					options: {
						now: new Date(2010, 1, 6, 4, 0)
					}
				};
				const r = mapTime({ hour: 8, meridiem: Meridiem.Auto }, e);

				expect(r).toEqual({
					hour: 8,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 8 with auto meridiem - after now, pm', () => {
				const e = {
					options: {
						now: new Date(2010, 1, 6, 16, 0)
					}
				};
				const r = mapTime({ hour: 8, meridiem: Meridiem.Auto }, e);

				expect(r).toEqual({
					hour: 20,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 12 with auto meridiem - after now, am', () => {
				const e = {
					options: {
						now: new Date(2010, 1, 6, 4, 0)
					}
				};
				const r = mapTime({ hour: 12, meridiem: Meridiem.Auto }, e);

				expect(r).toEqual({
					hour: 12,
					minute: 0,
					second: 0,
					milliOfSecond: 0
				});
			});

			it('Hour 12 with auto meridiem - after now, pm', () => {
				const e = {
					options: {
						now: new Date(2010, 1, 6, 16, 0)
					}
				};
				const r = mapTime({ hour: 12, meridiem: Meridiem.Auto }, e);

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
