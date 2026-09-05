import rfdc from 'rfdc';

import { Encounter } from '@ecolect/graph';

import { ExpressionPart } from './expression/ExpressionPart.js';
import { describe, refresh } from './expressions.js';

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

	/**
	 * Create a copy of this phrase. The values and the expression are copied
	 * deeply, so the copy can be changed without changing this phrase.
	 *
	 * @returns
	 *   copy of this phrase
	 */
	public clone(): Phrase<Values> {
		const r = new Phrase<Values>();
		r.score = this.score;
		r.values = clone(this.values);
		r.expression = clone(this.expression);
		return r;
	}
}

