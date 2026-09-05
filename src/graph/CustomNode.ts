import { Token } from '../tokenization/index.js';

import { Encounter } from './matching/Encounter.js';
import { after } from './matching/maybePromise.js';
import { Node } from './Node.js';

export type TokenValidator = (token: Token) => Promise<boolean | null> | boolean | null;

/**
 * Node that will validate the current token against a custom function.
 */
export class CustomNode extends Node {
	private validator: TokenValidator;

	public constructor(validator: TokenValidator) {
		super();

		this.validator = validator;
	}

	public match(encounter: Encounter) {
		const token = encounter.token();
		if(! token) return;

		return after(this.validator(token), r => {
			if(r !== null && typeof r !== 'undefined') {
				// This validator resolved a value, continue matching
				return encounter.advance(1, 1, r);
			}
		});
	}

	public equals(other: Node): boolean {
		return other instanceof CustomNode
			&& this.validator === other.validator;
	}

	public toDot() {
		return 'label="Custom"';
	}
}
