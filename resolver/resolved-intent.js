'use strict';

const { cloneObject } = require('../utils/cloning');
const expressions = require('./expressions');

module.exports = class ResolvedIntent {

	constructor(intent) {
		this.intent = intent;
		this.values = {};
	}

	_updateExpression(encounter) {
		this.expression = expressions.describe(encounter);
	}

	_refreshExpression() {
		expressions.refresh(this);
	}

	_clone() {
		const r = new ResolvedIntent(this.intent);
		r.values = cloneObject(this.values);
		r.expression = this.expression.map(cloneObject);
		return r;
	}
};

