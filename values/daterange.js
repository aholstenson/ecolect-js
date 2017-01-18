'use strict';

const date = require('./date');

module.exports = function(options) {
	options = options || {};
	options.range = true;
	return date(options);
};
