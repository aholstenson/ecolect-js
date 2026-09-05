import { en } from '../src/language/en/index.js';
import { booleanValue, dateValue } from '../src/values/index.js';

describe('Value: Matchers', () => {
	it('Can parse string', () => {
		const matcher = booleanValue().matcher(en);
		return matcher.match('yes')
			.then(v => expect(v).toEqual(true));
	});

	it('Can handle invalid value', () => {
		const matcher = booleanValue().matcher(en);
		return matcher.match('cookies')
			.then(v => expect(v).toEqual(null));
	});

	describe('Match options reach the value', () => {
		const matcher = dateValue().matcher(en);
		const options = { now: new Date(2020, 5, 15) };

		it('now is used for relative dates', () => {
			return matcher.match('tomorrow', options)
				.then(v => expect(v).toEqual({ year: 2020, month: 6, dayOfMonth: 16 }));
		});

		it('now is used when a date is mapped after matching', () => {
			// January is before now, so it resolves to next year
			return matcher.match('jan 12', options)
				.then(v => expect(v).toEqual({ year: 2021, month: 1, dayOfMonth: 12 }));
		});

		it('now is used for dates relative to other dates', () => {
			return matcher.match('3 days after jan 20', options)
				.then(v => expect(v).toEqual({ year: 2021, month: 1, dayOfMonth: 23 }));
		});

		it('partial matches use now', () => {
			return matcher.matchPartial('jan 12', options)
				.then(v => expect(v).toEqual([ { year: 2021, month: 1, dayOfMonth: 12 } ]));
		});
	});
});
