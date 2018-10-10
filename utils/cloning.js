'use strict';

const fastClone = require('fast-clone');

module.exports.cloneObject = function(a) {
	let result = {};
	for(const k in a) {
		if(a.hasOwnProperty(k)) result[k] = a[k];
	}
	return result;
};

module.exports.clone = function(r) {
	if(r._clone) {
		return r._clone();
	}

	return fastClone(r);
};
