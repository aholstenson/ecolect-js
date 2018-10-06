'use strict';

const addWeeks = require('date-fns/addWeeks');
const getWeek = require('date-fns/getWeek');

const currentTime = require('./currentTime');
const { map } = require('./date-intervals');

module.exports.thisWeek = function(r, e) {
	const time = currentTime(e);
	return {
		week: getWeek(time, e.options)
	};
};

module.exports.nextWeek = function(r, e) {
	const time = addWeeks(currentTime(e), 1);
	return {
		year: time.getFullYear(),
		week: getWeek(time, e.options)
	};
};

module.exports.previousWeek = function(r, e) {
	const time = addWeeks(currentTime(e), -1);
	return {
		year: time.getFullYear(),
		week: getWeek(time, e.options)
	};
};

/**
 * Map weeks as intervals.
 */
module.exports.map = function(r, e) {
	return map({ from: r, to: r }, e);
};
