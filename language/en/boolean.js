'use strict';

const GraphBuilder = require('../../graph/builder');

module.exports = function(language) {
	return new GraphBuilder(language)
		.name('boolean')

		.add('true', true)
		.add('on', true)
		.add('yes', true)

		.add('false', false)
		.add('off', false)
		.add('no', false)

		.onlyBest()

		.toMatcher();
};
