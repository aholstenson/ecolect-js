'use strict';

const naiveLanguage = require('./language/naive');
const ResolverBuilder = require('./resolver/builder');

class Builder {
	constructor(lang) {
		this._lang = lang || naiveLanguage;

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

	match(expression) {
		return this._resolver.match(expression);
	}
}

module.exports.builder = function(lang) {
	return new Builder(lang);
}
