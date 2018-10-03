'use strict';

module.exports.cloneObject = function(a) {
	let result = {};
	for(const k in a) {
		if(a.hasOwnProperty(k)) result[k] = a[k];
	}
	return result;
};

module.exports.clone = require('fast-clone');
