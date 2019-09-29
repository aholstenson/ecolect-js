import { Node } from './Node';

import { Language } from '../language/Language';
import { Token } from '../language/tokens';
import { Encounter } from './matching';

export class TokenNode extends Node {
	private readonly language: Language;
	public readonly token: Token;

	constructor(language: Language, token: Token) {
		super();

		this.token = token;
		this.supportsPunctuation = token.punctuation;
		this.language = language;
	}

	public match(encounter: Encounter) {
		const token = encounter.token();
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
				const partialAndLastToken = encounter.isPartial && encounter.isLastToken;
				const rootPartialAndFuzzy = encounter.isFuzzy && encounter.options.partial;
				const score = (partialAndLastToken || rootPartialAndFuzzy)
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
		 * 2) Punctuation and the current graph supports punctuation skipping
		 */
		if(((this.token.skippable || this.token.punctuation) && encounter.supportsFuzzy)
			|| (encounter.skipPunctuation && this.token.punctuation)) {
			/*
			 * This token is skippable, skip it without adding any score.
			 */
			return encounter.next(0.0, 0);
		}
	}

	public equals(other: Node): boolean {
		return other instanceof TokenNode && this.token.raw === other.token.raw;
	}

	public toString() {
		return 'TokenNode[' + this.token.raw + ']';
	}

	public toDot() {
		return 'label="' + this.token.raw + '"';
	}
}
