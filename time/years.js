'use strict';

const addYears = require('date-fns/add_years');
const setYear = require('date-fns/set_year');
const startOfYear = require('date-fns/start_of_year');

const currentTime = require('./currentTime');
const DateValue = require('./date-value');

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
