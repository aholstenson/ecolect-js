'use strict';

const intents = require('./intents');
const actions = require('./actions');

module.exports.intents = function(lang) {
	return new intents.Builder(lang);
};

module.exports.actions = function(lang) {
	return new actions.Builder(lang);
};
