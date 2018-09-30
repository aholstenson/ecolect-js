'use strict';

const toDate = require('./toDate');

module.exports = class DateValue {
	constructor(language) {
		Object.defineProperty(this, 'language', {
			value: language
		});
	}

	toDate(now) {
		return toDate(this, now || new Date());
	}
};
