'use strict';

const ValueParserNode = require('../resolver/value-parser');

class LanguageSpecificValue {
	constructor(factory) {
		this.factory = factory;
	}

	create(language) {
		return this.factory(language);
	}
}

module.exports.LanguageSpecificValue = LanguageSpecificValue;

module.exports.ParsingValue = class ParsingValue {
	constructor(parser, options) {
		this.parser = parser;
		this.options = options || {};
	}

	toNode(id) {
		return new ValueParserNode(id, this.parser, this.options);
	}
}
