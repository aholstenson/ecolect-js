import Node from './node';

export default class Token extends Node {
	constructor(language, token) {
		super();

		this.token = token;
		this.supportsPunctuation = token.punctuation;
		this.language = language;
	}

	match(encounter) {
		let token = encounter.token();
		if(token) {
			/*
			 * Consume a token in the input, score it and evaluate outgoing
			 * nodes for both full and partial matches.
			 */
			if(this.token.punctuation) {
				// Punctuation nodes must match directly
				if(this.token.normalized === token.normalized) {
					return encounter.next(0.1, 1);
				} else if(encounter.skipPunctuation) {
					// This token is punctuation and the encounter allows skipping
					return encounter.next(0.0, 0);
				}
			} else {
				const score = encounter.partial && encounter.isLastToken
					? this.language.comparePartialTokens(this.token, token)
					: this.language.compareTokens(this.token, token);

				if(score > 0) {
					return encounter.next(score, 1);
				}
			}
		} else if(encounter.partial) {
			/*
			 * We are matching partial intents and have no token so we should
			 * always match as this node is a potential continuation of the
			 * current expression.
			 */
			return encounter.next(1.0, 1);
		}

		if(encounter.fuzzy && (this.token.skippable || this.token.punctuation)) {
			/*
			 * This token is skippable, skip it without adding any score.
			 */
			return encounter.next(0.0, 0);
		}

		return;
	}

	equals(other) {
		return other instanceof Token && this.token.raw === other.token.raw;
	}

	toString() {
		return 'Token[' + this.token.raw + ']';
	}

	toDot() {
		return 'label="' + this.token.raw + '"';
	}
}
