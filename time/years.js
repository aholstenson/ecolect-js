'use strict';

const addYears = require('date-fns/addYears');
const setYear = require('date-fns/setYear');
const startOfYear = require('date-fns/startOfYear');

const currentTime = require('./currentTime');
const DateValue = require('./date-value');

module.exports.thisYear = function(r, e) {
	return {
		year: currentTime(e).getFullYear()
	};
};

module.exports.nextYear = function(r, e) {
	return {
		year: currentTime(e).getFullYear() + 1
	};
};

module.exports.previousYear = function(r, e) {
	return {
		year: currentTime(e).getFullYear() - 1
	};
};

module.exports.map = function(r, e) {
	const now = currentTime(e);

	let time;
	if(typeof r.relativeYears !== 'undefined') {
		// Relative year
		time = addYears(now, r.relativeYears);
	} else if(typeof r.year !== 'undefined') {
		time = setYear(now, r.year);
	} else {
		// No year available - skip it
		return null;
	}

	// Adjust the time to the start of the year
	time = startOfYear(time);

	const result = new DateValue(e.language);
	result.period = 'year';
	result.year = time.getFullYear();
	result.month = time.getMonth();
	result.day = time.getDate();
	return result;
};
