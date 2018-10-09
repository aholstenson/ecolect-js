'use strict';

const { LanguageSpecificValue, ParsingValue } = require('./index');

module.exports = function(options) {
	return new LanguageSpecificValue(language => new ParsingValue(language.dateTimeDuration, options));
};
