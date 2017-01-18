'use strict';

const ResolverBuilder = require('./resolver/builder');

class Builder {
	constructor(lang) {
		if(! lang || ! lang.tokenize || ! lang.compareTokens) {
			throw new Error('Language instance must be provided');
		}

		this._lang = lang;

		this._resolver = new ResolverBuilder(this._lang);
	}

	intent(id) {
		const self = this;
		const instance = new ResolverBuilder(this._lang, id);
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
				self._resolver.add(instance.build());
				return self;
			}
		};
	}

	build() {
		return new Matcher(this._resolver.build());
	}
}

class Matcher {
	constructor(resolver) {
		this._resolver = resolver;
	}

	match(expression, options) {
		return this._resolver.match(expression, options);
	}
}

module.exports.builder = function(lang) {
	return new Builder(lang);
}
