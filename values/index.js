'use strict';

const ValueParserNode = require('../resolver/value-parser');

class LanguageSpecificValue {
	constructor(factory) {
		this.factory = factory;
	}

	create(language) {
		return this.factory(language);
	}

	/**
	 * Create a matcher function for this value and the specified language.
	 *
	 * @param {Language} language
	 */
	matcher(language) {
		const parser = this.factory(language).parser;

		return function(text, options) {
			if(typeof text !== 'string') return Promise.resolve(null);

			return parser.match(text, options)
		};
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

	toDot() {
		return this.parser.toDot();
	}
}
