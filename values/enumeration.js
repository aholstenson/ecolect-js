'use strict';

const Parser = require('../parser');
const { LanguageSpecificValue, ParsingValue } = require('./index');

const DEFAULT_MAPPER = v => v;

module.exports = function(values, textMapper) {
	if(! textMapper) {
		textMapper = DEFAULT_MAPPER;
	}
	return new LanguageSpecificValue(language => {
		const parser = new Parser(language)
			.allowPartial();
		values.forEach(value => {
			parser.add(textMapper(value), value);
		});

		return new ParsingValue(parser, {
			supportsPartial: true
		});
	});
};
