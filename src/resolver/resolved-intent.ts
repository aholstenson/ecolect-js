import { describe, refresh } from './expressions';
import { Encounter } from '../graph/matching';
import { ExpressionPart } from './expression/ExpressionPart';
import { clone } from '../utils/cloning';

export class ResolvedIntent {
	public intent: string;
	public values: Map<string, any>;
	public score: number;
	public expression: ExpressionPart[];

	constructor(intent: string) {
		this.intent = intent;
		this.values = new Map();
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
		const r = new ResolvedIntent(this.intent);
		r.values = new Map(this.values);
		r.expression = clone(this.expression);
		return r;
	}
}

