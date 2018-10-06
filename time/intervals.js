'use strict';

const startOfYear = require('date-fns/startOfYear');
const startOfQuarter = require('date-fns/startOfQuarter');
const startOfWeek = require('date-fns/startOfWeek');
const startOfMonth = require('date-fns/startOfMonth');
const startOfDay = require('date-fns/startOfDay');
const startOfHour = require('date-fns/startOfHour');
const startOfMinute = require('date-fns/startOfMinute');
const startOfSecond = require('date-fns/startOfSecond');

const endOfYear = require('date-fns/endOfYear');
const endOfQuarter = require('date-fns/endOfQuarter');
const endOfWeek = require('date-fns/endOfWeek');
const endOfMonth = require('date-fns/endOfMonth');
const endOfDay = require('date-fns/endOfDay');
const endOfHour = require('date-fns/endOfHour');
const endOfMinute = require('date-fns/endOfMinute');
const endOfSecond = require('date-fns/endOfSecond');

module.exports.toStart = function(time, period, options=undefined) {
	switch(period) {
		case 'year':
			return startOfYear(time);
		case 'quarter':
			return startOfQuarter(time);
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
		case 'quarter':
			return endOfQuarter(time);
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
