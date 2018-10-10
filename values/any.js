'use strict';

const instance = {
	match(encounter) {
		encounter.match(encounter.text());
	}
};

module.exports = function() {
	return instance;
};
