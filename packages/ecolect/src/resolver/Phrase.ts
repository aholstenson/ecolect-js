import rfdc from 'rfdc';

import { Encounter } from '@ecolect/graph';

import { ExpressionPart } from './expression/ExpressionPart';
import { describe, refresh } from './expressions';

const clone = rfdc();

export class Phrase<Values extends object> {
	public values: Values;
	public score: number;
	public expression: ExpressionPart[];

	public constructor() {
		this.values = {} as Values;
		this.score = 0;
		this.expression = [];

		/*
		Object.defineProperty(this, 'expression', {
			enumerable: false,
			writable: true
		});
		*/
	}

	public updateExpression(encounter: Encounter) {
		this.expression = describe(encounter);
	}

	public refreshExpression() {
		refresh(this);
	}

	public clone() {
		const r = new Phrase();
		r.values = clone(this.values);
		r.expression = clone(this.expression);
		return r;
	}
}

