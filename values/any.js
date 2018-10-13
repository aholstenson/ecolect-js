'use strict';

const { ValueMatcher } = require('./index');

const instance = {
	match(encounter) {
		encounter.match(encounter.text());
	}
};

module.exports = function(options) {
	return new ValueMatcher(Object.assign({}, options, instance));
};
