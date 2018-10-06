'use strict';

const addQuarters = require('date-fns/addQuarters');
const getQuarter = require('date-fns/getQuarter');

const currentTime = require('./currentTime');
const { map } = require('./date-intervals');

module.exports.thisQuarter = function(r, e) {
	const time = currentTime(e);
	return {
		quarter: getQuarter(time, e.options)
	};
};

module.exports.nextQuarter = function(r, e) {
	const time = addQuarters(currentTime(e), 1);
	return {
		year: time.getFullYear(),
		quarter: getQuarter(time, e.options)
	};
};

module.exports.previousQuarter = function(r, e) {
	const time = addQuarters(currentTime(e), -1);
	return {
		year: time.getFullYear(),
		quarter: getQuarter(time, e.options)
	};
};

/**
 * Map quarters as intervals.
 */
module.exports.map = function(r, e) {
	return map({ from: r, to: r }, e);
};
