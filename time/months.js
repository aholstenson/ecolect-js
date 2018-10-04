'use strict';

const setYear = require('date-fns/setYear');

const addMonths = require('date-fns/addMonths')
const setMonth = require('date-fns/setMonth');
const startOfMonth = require('date-fns/startOfMonth');

const currentTime = require('./currentTime');
const DateValue = require('./date-value');

module.exports.thisMonth = function(r, e) {
	return {
		month: currentTime(e).getMonth()
	};
};

module.exports.nextMonth = function(r, e) {
	const time = addMonths(currentTime(e), 1);
	return {
		year: time.getFullYear(),
		month: time.getMonth()
	};
};

module.exports.previousMonth = function(r, e) {
	const time = addMonths(currentTime(e), -1);
	return {
		year: time.getFullYear(),
		month: time.getMonth()
	};
};

module.exports.map = function(r, e) {
	let time = currentTime(e);

	if(typeof r.year !== 'undefined') {
		time = setYear(time, r.year);
	}

	if(typeof r.relativeMonths !== 'undefined') {
		time = addMonths(time, r.relativeMonths);
	} else if(typeof r.month !== 'undefined') {
		time = setMonth(time, r.month)
	} else {
		// No month available - skip it
		return null;
	}

	// Set the time to the start of the month
	time = startOfMonth(time);

	const result = new DateValue(e.language);
	result.period = 'month';
	result.year = time.getFullYear();
	result.month = time.getMonth();
	result.day = time.getDate();
	return result;
};
