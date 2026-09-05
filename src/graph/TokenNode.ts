import { Token, TokenComparer } from '../tokenization/index.js';

import { Encounter } from './matching/index.js';
import { Node } from './Node.js';

/**
 * Score given when a punctuation token in the graph matches the same
 * punctuation in the expression.
 */
const PUNCTUATION_SCORE = 0.1;

export class TokenNode extends Node {
	private readonly comparer: TokenComparer;
	public readonly token: Token;

	public constructor(comparer: TokenComparer, token: Token) {
		super();

		this.token = token;
		this.supportsPunctuation = token.punctuation;
		this.comparer = comparer;
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
					return encounter.advance(PUNCTUATION_SCORE, 1);
				} else if(encounter.skipPunctuation) {
					/*
					 * The expression left this punctuation out, such as
					 * writing a time as `14 00` instead of `14:00`. This
					 * still matches, but it costs what the punctuation would
					 * have scored, so a reading that has the punctuation is
					 * preferred.
					 */
					return encounter.advance(- PUNCTUATION_SCORE, 0);
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
				const rootPartialAndFuzzy = encounter.isFuzzy && encounter.isPartialInput;
				const score = (partialAndLastToken || rootPartialAndFuzzy)
					? this.comparer.comparePartial(this.token, token)
					: this.comparer.compare(this.token, token);

				if(score > 0) {
					return encounter.advance(score, 1);
				}
			}
		} else if(encounter.isPartial) {
			/*
			 * We are matching partial intents and have no token so we should
			 * always match as this node is a potential continuation of the
			 * current expression.
			 */
			return encounter.advance(1.0, 1);
		}

		/*
		 * Extra skips based on this token node. If this token is
		 *
		 * 1) Skippable or punctuation and the current graph supports fuzzying
		 * 2) Punctuation and the current graph supports punctuation skipping
		 */
		if(((encounter.isSkippable(this.token) || this.token.punctuation) && encounter.supportsFuzzy)
			|| (encounter.skipPunctuation && this.token.punctuation)) {
			/*
			 * This token is skippable, skip it without adding any score.
			 */
			return encounter.advance(0.0, 0);
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
