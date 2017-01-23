'use strict';

const Parser = require('../../parser');

module.exports = function(language) {
	return new Parser(language)

		.add('true', true)
		.add('on', true)
		.add('yes', true)

		.add('false', false)
		.add('off', false)
		.add('no', false)

		.onlyBest();
}
