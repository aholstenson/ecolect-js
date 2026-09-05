import { resolveLocale } from '../../src/language/resolveLocale.js';
import { DateOrder } from '../../src/type-datetime/index.js';


describe('Locale', function() {
	describe('Date order', function() {
		it('en-US writes the month first', function() {
			expect(resolveLocale('en-US').dateOrder).toEqual(DateOrder.MonthDayYear);
		});

		it('en-GB writes the day first', function() {
			expect(resolveLocale('en-GB').dateOrder).toEqual(DateOrder.DayMonthYear);
		});

		it('de-DE writes the day first', function() {
			expect(resolveLocale('de-DE').dateOrder).toEqual(DateOrder.DayMonthYear);
		});

		it('sv-SE writes the year first', function() {
			expect(resolveLocale('sv-SE').dateOrder).toEqual(DateOrder.YearMonthDay);
		});

		it('ja-JP writes the year first', function() {
			expect(resolveLocale('ja-JP').dateOrder).toEqual(DateOrder.YearMonthDay);
		});
	});

	/*
	 * Days are counted as `DateTimeOptions` counts them, so Sunday is 0 and
	 * Saturday is 6.
	 */
	describe('Start of week', function() {
		it('en-US starts weeks on Sunday', function() {
			expect(resolveLocale('en-US').weekStartsOn).toEqual(0);
		});

		it('en-GB starts weeks on Monday', function() {
			expect(resolveLocale('en-GB').weekStartsOn).toEqual(1);
		});

		it('ar-EG starts weeks on Saturday', function() {
			expect(resolveLocale('ar-EG').weekStartsOn).toEqual(6);
		});
	});

	describe('First week of the year', function() {
		it('en-US counts the week with January 1st in it', function() {
			expect(resolveLocale('en-US').firstWeekContainsDate).toEqual(1);
		});

		it('en-GB uses the ISO week system', function() {
			expect(resolveLocale('en-GB').firstWeekContainsDate).toEqual(4);
		});

		it('sv-SE uses the ISO week system', function() {
			expect(resolveLocale('sv-SE').firstWeekContainsDate).toEqual(4);
		});

		/*
		 * Australia starts weeks on Monday but still counts the week with
		 * January 1st in it, so the two settings cannot be read from the same
		 * source.
		 */
		it('en-AU counts the week with January 1st in it', function() {
			expect(resolveLocale('en-AU').firstWeekContainsDate).toEqual(1);
		});

		it('a locale without a region is read via its language', function() {
			expect(resolveLocale('sv').firstWeekContainsDate).toEqual(4);
		});
	});

	describe('Number separators', function() {
		it('en-US separates with a point', function() {
			const settings = resolveLocale('en-US');
			expect(settings.decimalSeparator).toEqual('.');
			expect(settings.groupSeparator).toEqual(',');
		});

		it('de-DE separates with a comma', function() {
			const settings = resolveLocale('de-DE');
			expect(settings.decimalSeparator).toEqual(',');
			expect(settings.groupSeparator).toEqual('.');
		});
	});

	describe('Invalid locales', function() {
		it('throws for a tag that cannot be read', function() {
			expect(() => resolveLocale('not a locale')).toThrow();
		});
	});
});
