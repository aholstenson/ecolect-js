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
				if(this.token.normalized === token.normalized) {
					// Punctuation nodes must match directly
					return encounter.next(0.1, 1);
				} else if(encounter.skipPunctuation) {
					// This token is punctuation and the encounter allows skipping
					return encounter.next(0.0, 0);
				}
			} else {
				/*
				 * Select a way to compare the tokens. If this is a partial
				 * match, use partial comparison if:
				 *
				 * 1) This is the last token of the input
				 * 2) We are also performing fuzzy matching
				 */
				const score = (encounter.isPartial && (encounter.isFuzzy || encounter.isLastToken))
					? this.language.comparePartialTokens(this.token, token)
					: this.language.compareTokens(this.token, token);

				if(score > 0) {
					return encounter.next(score, 1);
				}
			}
		} else if(encounter.isPartial) {
			/*
			 * We are matching partial intents and have no token so we should
			 * always match as this node is a potential continuation of the
			 * current expression.
			 */
			return encounter.next(1.0, 1);
		}

		/*
		 * Extra skips based on this token node. If this token is
		 *
		 * 1) Skippable or punctuation and the current graph supports fuzzying
		 * 2) Puncutation and the current graph supports punctuation skipping
		 */
		if(((this.token.skippable || this.token.punctuation) && encounter.supportsFuzzy)
			|| (encounter.skipPunctuation && this.token.punctuation)) {
			/*
			 * This token is skippable, skip it without adding any score.
			 */
			return encounter.next(0.0, 0);
		}
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
