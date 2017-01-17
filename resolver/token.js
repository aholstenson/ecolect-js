'use strict';

const Node = require('./node');

class Token extends Node {
	constructor(language, token) {
		super();

		this.token = token;
		this.language = language;
	}

	match(encounter) {
		const token = encounter.token();
		if(! token) return false;

		const score = this.language.compareTokens(this.token, token);
		if(score > 0) {
			return encounter.next(score, 1);
		}

		return false;
	}

	toString() {
		return 'Token[' + this.token.raw + ']';
	}
}

module.exports = Token;
