import Node from './node';

/**
 * Node that matches a token against a regular expression.
 */
export default class RegExpNode extends Node {
	constructor(regexp) {
		super();

		this.regexp = regexp;
	}

	match(encounter) {
		// If there is no token available - skip this node
		const token = encounter.token();
		if(! token) return;

		// Reset and check the regular expression
		this.regexp.previousIndex = 0;
		const match = this.regexp.exec(token.raw);
		if(! match) return;

		// If match consume the current token and push data onto the stack
		return encounter.next(1, 1, match[0]);
	}

	equals(other) {
		return other instanceof RegExpNode && this.regexp.source === other.regexp.source;
	}

	toString() {
		return 'RegExp[' + this.regexp + ']';
	}

	toDot() {
		return 'label="' + this.regexp + '"';
	}
}
