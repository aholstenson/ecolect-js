import toDate from './toDate';

export default class DateValue {
	constructor(language) {
		Object.defineProperty(this, 'language', {
			value: language
		});
	}

	toDate(now) {
		return toDate(this, now || new Date());
	}
}
