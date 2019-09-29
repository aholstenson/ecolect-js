import { Node } from './Node';
import { Token } from '../language/tokens/Token';
import { Encounter } from './matching/Encounter';

export type TokenValidator = (token: Token) => Promise<boolean | null> | boolean | null;

/**
 * Node that will validate the current token against a custom function.
 */
export class CustomNode extends Node {
	private validator: TokenValidator;

	constructor(validator: TokenValidator) {
		super();

		this.validator = validator;
	}

	public match(encounter: Encounter) {
		const token = encounter.token();
		if(! token) return;

		return Promise.resolve(this.validator(token))
			.then(r => {
				if(r != null && typeof r !== 'undefined') {
					// This validator resolved a value, continue matching
					return encounter.next(1, 1, r);
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
