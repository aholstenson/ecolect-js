const chai = require('chai');
const expect = chai.expect;

const {
	combine,
	time12h,
	time24h,

	mapYear,
	mapMonth,
	mapDate,
	mapTime
} = require('../../language/dates');

describe('Language utils', () => {
	describe('Dates', () => {
		describe('combine()', () => {
			it('No keys in B', () => {
				const a = { year: 2018 };
				const b = { };

				const r = combine(a, b);

				expect(r).to.deep.equal({
					year: 2018
				});
			});

			it('Keys in B copied to A', () => {
				const a = { year: 2018 };
				const b = { month: 1 };

				const r = combine(a, b);

				expect(r).to.deep.equal({
					year: 2018,
					month: 1
				});
			});

			it('Keys in B overwrite keys in A', () => {
				const a = { year: 2018 };
				const b = { year: 2019 };

				const r = combine(a, b);

				expect(r).to.deep.equal({
					year: 2019
				});
			});

			it('relative property accumulated', () => {
				const a = { relative: 2 };
				const b = { relative: 4 };

				const r = combine(a, b);

				expect(r).to.deep.equal({
					relative: 6
				});
			});
		});

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

		describe('mapYear', () => {
			const e = {
				options: {
					now: new Date(2017, 2, 24)
				}
			};

			it('relativeYears resolves to current year', () => {
				const r = mapYear({ relativeYears: 0 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2017,
					month: 0,
					day: 1
				});
			});

			it('relativeYears resolves positive years', () => {
				const r = mapYear({ relativeYears: 2 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2019,
					month: 0,
					day: 1
				});
			});

			it('relativeYears resolves negative years', () => {
				const r = mapYear({ relativeYears: -2 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2015,
					month: 0,
					day: 1
				});
			});

			it('Absolute year', () => {
				const r = mapYear({ year: 2015 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2015,
					month: 0,
					day: 1
				});
			});
		});

		describe('mapMonth', () => {
			const e = {
				options: {
					now: new Date(2017, 2, 24)
				}
			};

			it('relativeMonths resolves to current year and month', () => {
				const r = mapMonth({ relativeMonths: 0 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 2,
					day: 1
				});
			});

			it('relativeMonths resolves to current year and +2 months', () => {
				const r = mapMonth({ relativeMonths: 2 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 4,
					day: 1
				});
			});

			it('relativeMonths resolves to current year and -2 months', () => {
				const r = mapMonth({ relativeMonths: -2 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 0,
					day: 1
				});
			});

			it('relativeMonths resolves to previous year', () => {
				const r = mapMonth({ relativeMonths: -4 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2016,
					month: 10,
					day: 1
				});
			});

			it('Absolute month', () => {
				const r = mapMonth({ month: 5 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 5,
					day: 1
				});
			});
		});

		describe('mapDate', () => {
			const e = {
				options: {
					now: new Date(2017, 2, 24)
				}
			};

			it('relativeYears keeps month and day', () => {
				const r = mapDate({ relativeYears: 0 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2017,
					month: 2,
					day: 24
				});
			});

			it('relativeYears works with positive years', () => {
				const r = mapDate({ relativeYears: 2 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2019,
					month: 2,
					day: 24
				});
			});

			it('relativeYears works with negative years', () => {
				const r = mapDate({ relativeYears: -2 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2015,
					month: 2,
					day: 24
				});
			});

			it('year resets month and day', () => {
				const r = mapDate({ year: 2018 }, e);

				expect(r).to.deep.equal({
					period: 'year',
					year: 2018,
					month: 0,
					day: 1
				});
			});

			it('relativeWeeks keeps day', () => {
				const r = mapDate({ relativeWeeks: 0 }, e);

				expect(r).to.deep.equal({
					period: 'week',
					year: 2017,
					month: 2,
					day: 24
				});
			});

			it('relativeWeeks changes week', () => {
				const r = mapDate({ relativeWeeks: 2 }, e);

				expect(r).to.deep.equal({
					period: 'week',
					year: 2017,
					month: 3,
					day: 7
				});
			});

			it('week after current week keeps year', () => {
				const r = mapDate({ week: 13 }, e);

				expect(r).to.deep.equal({
					period: 'week',
					year: 2017,
					month: 2,
					day: 26
				});
			});

			it('week before current week is next year', () => {
				const r = mapDate({ week: 11}, e);

				expect(r).to.deep.equal({
					period: 'week',
					year: 2018,
					month: 2,
					day: 11
				});
			});

			it('week before current week with past=true keeps year', () => {
				const r = mapDate({ week: 11, past: true }, e);

				expect(r).to.deep.equal({
					period: 'week',
					year: 2017,
					month: 2,
					day: 12
				});
			});

			it('relativeMonths keeps day', () => {
				const r = mapDate({ relativeMonths: 2 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 4,
					day: 24
				});
			});

			it('month after current month is same year', () => {
				const r = mapDate({ month: 4 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 4,
					day: 1
				});
			});

			it('month before current month is next year', () => {
				const r = mapDate({ month: 1 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2018,
					month: 1,
					day: 1
				});
			});

			it('month before current month with past=true is same year', () => {
				const r = mapDate({ month: 1, past: true }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 1,
					day: 1
				});
			});

			it('month before current month with year', () => {
				const r = mapDate({ month: 1, year: 2017 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 1,
					day: 1
				});
			});

			it('month after current month with year', () => {
				const r = mapDate({ month: 6, year: 2017 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2017,
					month: 6,
					day: 1
				});
			});

			it('day after the current day is same month', () => {
				const r = mapDate({ day: 28 }, e);

				expect(r).to.deep.equal({
					period: 'day',
					year: 2017,
					month: 2,
					day: 28
				});
			});

			it('day before the current day is next month', () => {
				const r = mapDate({ day: 2 }, e);

				expect(r).to.deep.equal({
					period: 'day',
					year: 2017,
					month: 3,
					day: 2
				});
			});

			it('relativeYears and relativeMonths keeps day', () => {
				const r = mapDate({ relativeYears: 1, relativeMonths: 2 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2018,
					month: 4,
					day: 24
				});
			});

			it('relativeYears, relativeMonths and relativeDays', () => {
				const r = mapDate({ relativeYears: 1, relativeMonths: 2 }, e);

				expect(r).to.deep.equal({
					period: 'month',
					year: 2018,
					month: 4,
					day: 24
				});
			});

			it('year, month and day', () => {
				const r = mapDate({ year: 2019, month: 1, day: 2 }, e);

				expect(r).to.deep.equal({
					period: 'day',
					year: 2019,
					month: 1,
					day: 2
				});
			});
		});

		describe('mapTime', () => {
			const defaultE = {
				options: {
					now: new Date(2010, 1, 6, 10, 0)
				}
			};

			it('Hour 14 with fixed meridiem', () => {
				const r = mapTime({ hour: 15, meridiem: 'fixed' }, defaultE);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 15,
					minute: 0,
					second: 0
				});
			});

			it('Hour 8 with fixed meridiem', () => {
				const r = mapTime({ hour: 8, meridiem: 'fixed' }, defaultE);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 8,
					minute: 0,
					second: 0
				});
			});

			it('Hour 8 with am meridiem', () => {
				const r = mapTime({ hour: 8, meridiem: 'am' }, defaultE);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 8,
					minute: 0,
					second: 0
				});
			});

			it('Hour 12 with am meridiem', () => {
				const r = mapTime({ hour: 12, meridiem: 'am' }, defaultE);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 0,
					minute: 0,
					second: 0
				});
			});

			it('Hour 8 with pm meridiem', () => {
				const r = mapTime({ hour: 8, meridiem: 'pm' }, defaultE);

				expect(r).to.deep.equal({
					period: 'hour',
					precision: 'normal',

					hour: 20,
					minute: 0,
					second: 0
				});
			});

			it('Hour 12 with pm meridiem', () => {
				const r = mapTime({ hour: 12, meridiem: 'pm' }, defaultE);

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
				const r = mapTime({ hour: 8, meridiem: 'auto' }, e);

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
				const r = mapTime({ hour: 8, meridiem: 'auto' }, e);

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
				const r = mapTime({ hour: 8, meridiem: 'auto' }, e);

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
				const r = mapTime({ hour: 12, meridiem: 'auto' }, e);

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
				const r = mapTime({ hour: 12, meridiem: 'auto' }, e);

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
