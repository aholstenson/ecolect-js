'use strict';

const startOfYear = require('date-fns/start_of_year');
const startOfWeek = require('date-fns/start_of_week');
const startOfMonth = require('date-fns/start_of_month');
const startOfDay = require('date-fns/start_of_day');
const startOfHour = require('date-fns/start_of_hour');
const startOfMinute = require('date-fns/start_of_minute');
const startOfSecond = require('date-fns/start_of_second');

const endOfYear = require('date-fns/end_of_year');
const endOfWeek = require('date-fns/end_of_week');
const endOfMonth = require('date-fns/end_of_month');
const endOfDay = require('date-fns/end_of_day');
const endOfHour = require('date-fns/end_of_hour');
const endOfMinute = require('date-fns/end_of_minute');
const endOfSecond = require('date-fns/end_of_second');

module.exports.toStart = function(time, period, options=undefined) {
	switch(period) {
		case 'year':
			return startOfYear(time);
		case 'week':
			return startOfWeek(time, options);
		case 'month':
			return startOfMonth(time);
		case 'day':
			return startOfDay(time);
		case 'hour':
			return startOfHour(time);
		case 'minute':
			return startOfMinute(time);
		case 'second':
			return startOfSecond(time);
	}

	// Default case, just ignore and return full time
	return time;
};

module.exports.toEnd = function(time, period, options=undefined) {
	switch(period) {
		case 'year':
			return endOfYear(time);
		case 'week':
			return endOfWeek(time, options);
		case 'month':
			return endOfMonth(time);
		case 'day':
			return endOfDay(time);
		case 'hour':
			return endOfHour(time);
		case 'minute':
			return endOfMinute(time);
		case 'second':
			return endOfSecond(time);
	}

	// Default case, just ignore and return full time
	return time;
};

