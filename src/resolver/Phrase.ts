import rfdc from 'rfdc';

import type { Encounter } from '../graph/index.js';
import { cloneData } from '../graph/index.js';

import type { ExpressionPart } from './expression/ExpressionPart.js';
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
	 * Create a copy of this phrase. Values can be set and removed on the copy
	 * without changing this phrase. The values themselves are not copied, as
	 * a deep copy changes values such as numbers and dates into plain
	 * objects. The expression is copied deeply.
	 *
	 * @returns
	 *   copy of this phrase
	 */
	public clone(): Phrase<Values> {
		const r = new Phrase<Values>();
		r.score = this.score;
		r.values = { ...this.values };
		r.expression = clone(this.expression);
		return r;
	}

	/**
	 * Copy this phrase when a match that contains it is copied.
	 *
	 * @returns
	 *   copy of this phrase
	 */
	public [cloneData](): Phrase<Values> {
		return this.clone();
	}
}

