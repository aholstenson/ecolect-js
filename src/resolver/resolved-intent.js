import { cloneObject } from '../utils/cloning';
import { describe, refresh } from './expressions';

export default class ResolvedIntent {

	constructor(intent) {
		this.intent = intent;
		this.values = {};
	}

	_updateExpression(encounter) {
		this.expression = describe(encounter);
	}

	_refreshExpression() {
		refresh(this);
	}

	_clone() {
		const r = new ResolvedIntent(this.intent);
		r.values = cloneObject(this.values);
		r.expression = this.expression.map(cloneObject);
		return r;
	}
}

