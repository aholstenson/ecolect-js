'use strict';

const GraphBuilder = require('../graph/builder');
const { LanguageSpecificValue, ParsingValue } = require('./index');

const DEFAULT_MAPPER = v => v;

module.exports = function(values, textMapper) {
	if(! textMapper) {
		textMapper = DEFAULT_MAPPER;
	}
	return new LanguageSpecificValue(language => {
		const builder = new GraphBuilder(language)
			.allowPartial();

			values.forEach(value => {
			builder.add(textMapper(value), value);
		});

		return new ParsingValue(builder.toMatcher(), {
			supportsPartial: true
		});
	});
};
