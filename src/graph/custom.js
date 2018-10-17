import Node from './node';

/**
 * Node that will validate the current token against a custom function.
 */
export default class CustomNode extends Node {
	constructor(validator) {
		super();

		this.validator = validator;
	}

	match(encounter) {
		const token = encounter.token();
		if(! token) return;

		return Promise.resolve(this.validator(token))
			.then(r => {
				if(typeof r !== 'undefined' && r !== null) {
					// This validator resolved a value, continue matching
					return encounter.next(1, 1, r);
				}
			});
	}

	equals(other) {
		return other instanceof CustomNode
			&& this.validator === other.validator;
	}

	toDot() {
		return 'label="Custom"';
	}
}
