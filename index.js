'use strict';

const ResolverBuilder = require('./resolver/builder');

class Builder {
	constructor(language) {
		if(! language || ! language.tokenize || ! language.compareTokens) {
			throw new Error('Language instance must be provided');
		}

		this.language = language;

		this.builder = new ResolverBuilder(this.language);
	}

	intent(id) {
		const self = this;
		const instance = new ResolverBuilder(this.language, id);
		return {
			value(id, type) {
				instance.value(id, type);
				return this;
			},

			add() {
				instance.add.apply(instance, arguments);
				return this;
			},

			done() {
				self.builder.add(instance.build());
				return self;
			}
		};
	}

	build() {
		return new Matcher(this.builder.build());
	}
}

class Matcher {
	constructor(parser) {
		this.parser = parser;
		this.language = parser.language;
	}

	match(expression, options) {
		return this.parser.match(expression, options);
	}
}

module.exports.intents = function(lang) {
	return new Builder(lang);
}
