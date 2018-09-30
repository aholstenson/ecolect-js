'use strict';

const cloneDeep = require('lodash.clonedeep');

/**
 * Check if a given result is currently relative.
 */
module.exports.isRelative = function(v) {
	return typeof v.relativeMonths === 'number'
		|| typeof v.relativeWeeks === 'number'
		|| typeof v.relativeDays === 'number'
		|| typeof v.relativeHours === 'number'
		|| typeof v.relativeMinutes === 'number'
		|| typeof v.relativeSeconds === 'number';
};

module.exports.hasMonth = function(v) {
	if(typeof v.month === 'undefined') return false;

	if(typeof v.year !== 'undefined' && typeof v.day !== 'undefined') return false;

	return true;
};


module.exports.combine = function(a, b) {
	const result = cloneDeep(a);
	for(const key of Object.keys(b)) {
		if(key === 'relative' && typeof result[key] === 'number') {
			result[key] += b[key];
		} else {
			result[key] = b[key];
		}
	}

	return result;
};

/**
 * Indicate that the interesting date is the end of the range.
 */
module.exports.endOf = function(v) {
	if(Array.isArray(v)) {
		v = v[0];
	}

	v = cloneDeep(v);
	v.intervalEdge = 'end';
	return v;
};

/**
 * Indicate that the interesting date is at the beginning of the range.
 */
module.exports.startOf = function(v) {
	if(Array.isArray(v)) {
		v = v[0];
	}

	v = cloneDeep(v);
	v.intervalEdge = 'start';
	return v;
};

/**
 * Create an interval between the two values. Handles the case where one or
 * both values are already an interval.
 */
module.exports.between = function(start, end) {
	if(Array.isArray(start)) {
		return module.exports.between(start[0], start[1]);
	}

	return {
		start: start.start ? start.start : start,
		end: end && end.start ? end.start : end
	};
};
