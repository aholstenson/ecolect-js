import { Node } from './node';
import { Encounter } from './matching/encounter';

/**
 * Node that matches a token against a regular expression.
 */
export class RegExpNode extends Node {
	private regexp: RegExp;

	constructor(regexp: RegExp) {
		super();

		this.regexp = regexp;
	}

	public match(encounter: Encounter) {
		// If there is no token available - skip this node
		const token = encounter.token();
		if(! token) return;

		// Reset and check the regular expression
		this.regexp.lastIndex = 0;
		const match = this.regexp.exec(token.raw);
		if(! match) return;

		// If match consume the current token and push data onto the stack
		return encounter.next(1, 1, match[0]);
	}

	public equals(other: Node): boolean {
		return other instanceof RegExpNode && this.regexp.source === other.regexp.source;
	}

	public toString(): string {
		return 'RegExp[' + this.regexp + ']';
	}

	public toDot(): string {
		return 'label="' + this.regexp + '"';
	}
}
