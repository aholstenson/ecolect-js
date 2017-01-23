'use strict';

const { LanguageSpecificValue, ParsingValue } = require('./index');

module.exports = function() {
	return new LanguageSpecificValue(language => new ParsingValue(language.number));
};
