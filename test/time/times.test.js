
const chai = require('chai');
const expect = chai.expect;

const { time12h, time24h, map } = require('../../time/times');

describe('Time', () => {
	describe('times', () => {
		describe('time12h', () => {
			it('Full time', () => {
				const r = time12h(8, 12, 42);
				expect(r).to.deep.equal({
					hour: 8,
					minute: 12,
					second: 42,
					meridiem: 'auto'
				})
			});

			it('Hour + minute', () => {
				const r = time12h(8, 12);
				expect(r).to.deep.equal({
					hour: 8,
					minute: 12,
					second: undefined,
					meridiem: 'auto'
				})
			});

			it('Hour', () => {
				const r = time12h(8);
				expect(r).to.deep.equal({
					hour: 8,
					minute: undefined,
					second: undefined,
					meridiem: 'auto'
				})
			});

			it('Hour 0 has fixed meridiem', () => {
				const r = time12h(0, 12, 42);
				expect(r).to.deep.equal({
					hour: 0,
					minute: 12,
					second: 42,
					meridiem: 'fixed'
				})
			});

			it('Hour > 12 has fixed meridiem', () => {
				const r = time12h(13, 12, 42);
				expect(r).to.deep.equal({
					hour: 13,
					minute: 12,
					second: 42,
					meridiem: 'fixed'
				})
			});
		});

		describe('time24h', () => {
			it('Full time', () => {
				const r = time24h(8, 12, 42);
				expect(r).to.deep.equal({
					hour: 8,
					minute: 12,
					second: 42,
					meridiem: 'fixed'
				})
			});

			it('Hour + minute', () => {
				const r = time24h(8, 12);
				expect(r).to.deep.equal({
					hour: 8,
					minute: 12,
					second: undefined,
					meridiem: 'fixed'
				})
			});

			it('Hour', () => {
				const r = time24h(8);
				expect(r).to.deep.equal({
					hour: 8,
					minute: undefined,
					second: undefined,
					meridiem: 'fixed'
				})
			});

			it('Hour > 12', () => {
				const r = time24h(13, 12, 42);
				expect(r).to.deep.equal({
					hour: 13,
					minute: 12,
					second: 42,
					meridiem: 'fixed'
				})
			});
		});

		describe('map', () => {
			const defaultE = {
				options: {
					now: new Date(2010, 1, 6, 10, 0)
				}
			};

			it('Hour 14 with fixed meridiem', () => {
				const r = map({ hour: 15, meridiem: 'fixed' }, defaultE);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 15,
					minute: 0,
					second: 0
				});
			});

			it('Hour 8 with fixed meridiem', () => {
				const r = map({ hour: 8, meridiem: 'fixed' }, defaultE);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 8,
					minute: 0,
					second: 0
				});
			});

			it('Hour 8 with am meridiem', () => {
				const r = map({ hour: 8, meridiem: 'am' }, defaultE);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 8,
					minute: 0,
					second: 0
				});
			});

			it('Hour 12 with am meridiem', () => {
				const r = map({ hour: 12, meridiem: 'am' }, defaultE);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 0,
					minute: 0,
					second: 0
				});
			});

			it('Hour 8 with pm meridiem', () => {
				const r = map({ hour: 8, meridiem: 'pm' }, defaultE);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 20,
					minute: 0,
					second: 0
				});
			});

			it('Hour 12 with pm meridiem', () => {
				const r = map({ hour: 12, meridiem: 'pm' }, defaultE);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 12,
					minute: 0,
					second: 0
				});
			});

			it('Hour 8 with auto meridiem - before now', () => {
				const e = {
					options: {
						now: new Date(2010, 1, 6, 10, 0)
					}
				};
				const r = map({ hour: 8, meridiem: 'auto' }, e);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 20,
					minute: 0,
					second: 0
				});
			});

			it('Hour 8 with auto meridiem - after now, am', () => {
				const e = {
					options: {
						now: new Date(2010, 1, 6, 4, 0)
					}
				};
				const r = map({ hour: 8, meridiem: 'auto' }, e);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 8,
					minute: 0,
					second: 0
				});
			});

			it('Hour 8 with auto meridiem - after now, pm', () => {
				const e = {
					options: {
						now: new Date(2010, 1, 6, 16, 0)
					}
				};
				const r = map({ hour: 8, meridiem: 'auto' }, e);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 20,
					minute: 0,
					second: 0
				});
			});

			it('Hour 12 with auto meridiem - after now, am', () => {
				const e = {
					options: {
						now: new Date(2010, 1, 6, 4, 0)
					}
				};
				const r = map({ hour: 12, meridiem: 'auto' }, e);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 12,
					minute: 0,
					second: 0
				});
			});

			it('Hour 12 with auto meridiem - after now, pm', () => {
				const e = {
					options: {
						now: new Date(2010, 1, 6, 16, 0)
					}
				};
				const r = map({ hour: 12, meridiem: 'auto' }, e);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 0,
					minute: 0,
					second: 0
				});
			});
		});
	});
});
