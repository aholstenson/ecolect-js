import { describe, refresh } from './expressions';
import { Encounter } from '../graph/matching';
import { ExpressionPart } from './expression/ExpressionPart';
import { clone } from '../utils/cloning';

export class Phrase<Values extends object> {
	public values: Values;
	public score: number;
	public expression: ExpressionPart[];

	constructor() {
		this.values = {} as Values;
		this.score = 0;
		this.expression = [];

		Object.defineProperty(this, 'expression', {
			enumerable: false,
			writable: true
		});
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

