'use strict';

module.exports.currentTime = function(encounter) {
	if(encounter.options.now) {
		return encounter.options.now;
	} else {
		return encounter.options.now = new Date();
	}
};

module.exports.toDate = function toDate(date, now) {
	return new Date(
		typeof date.year !== 'undefined' ? date.year : now.getFullYear(),
		typeof date.month !== 'undefined' ? date.month : now.getMonth(),
		typeof date.day !== 'undefined' ? date.day : now.getDate()
	);
};

module.exports.mapYear = function(r, e) {
	const now = module.exports.currentTime(e);
	if(r.adjusters) {
		r.adjusters.forEach(a => a(r, now));
	}

	const result = {};
	if(typeof r.year !== 'undefined') {
		result.year = r.year;
	}
	if(typeof r.month !== 'undefined') {
		result.month = r.month;
	}

	return new DateValue(e.language, result);
};

module.exports.mapMonth = module.exports.mapYear;

module.exports.mapDate = function(r, e) {
	const now = module.exports.currentTime(e);
	if(r.adjusters) {
		r.adjusters.forEach(a => a(r, now));
	}

	const result = {};
	if(typeof r.year !== 'undefined') {
		result.year = r.year;
	} else {
		result.year = now.getFullYear();
	}
	if(typeof r.month !== 'undefined') {
		result.month = r.month;
	} else {
		result.month = now.getMonth();
	}
	if(typeof r.day !== 'undefined') {
		result.day = r.day;
	} else {
		result.day = now.getDate();
	}
	if(typeof r.dayOfWeek !== 'undefined') {
		result.dayOfWeek = r.dayOfWeek;
	}

	return new DateValue(e.language, result);
};

function copy(from, to, value) {
	if(typeof from[value] !== 'undefined') {
		to[value] = from[value];
	}
}

class DateValue {
	constructor(language, data) {
		copy(data, this, 'year');
		copy(data, this, 'month');
		copy(data, this, 'day');

		copy(data, this, 'hour');
		copy(data, this, 'minute');
		copy(data, this, 'second');

		Object.defineProperty(this, 'language', {
			value: language
		});
	}

	toDate() {
		return module.exports.toDate(this, new Date());
	}
}
