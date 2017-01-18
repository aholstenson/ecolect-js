'use strict';

const instance = {
	match(encounter) {
		return encounter.text();
	}
};

module.exports = function() {
	return instance;
};
