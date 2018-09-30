'use strict';

const addMonths = require('date-fns/add_months')
const setMonth = require('date-fns/set_month');
const startOfMonth = require('date-fns/start_of_month');

const currentTime = require('./currentTime');
const DateValue = require('./date-value');

module.exports.map = function(r, e) {
	const now = currentTime(e);

	let time;
	if(typeof r.relativeMonths !== 'undefined') {
		time = addMonths(now, r.relativeMonths);
	} else if(typeof r.month !== 'undefined') {
		time = setMonth(now, r.month)
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
