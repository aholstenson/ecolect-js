import type { Token, TokenComparer } from '../tokenization/index.js';

import type { Encounter } from './matching/index.js';
import { Node } from './Node.js';

/**
 * Score given when a punctuation token in the graph matches the same
 * punctuation in the expression.
 */
const PUNCTUATION_SCORE = 0.1;

export class TokenNode extends Node {
	private readonly comparer: TokenComparer;
	public readonly token: Token;

	/**
	 * Normalized tokens of the words in the graph of this node.
	 */
	private readonly knownTokens: ReadonlySet<string>;

	public constructor(comparer: TokenComparer, token: Token, knownTokens: ReadonlySet<string> = new Set()) {
		super();

		this.token = token;
		this.supportsPunctuation = token.punctuation;
		this.comparer = comparer;
		this.knownTokens = knownTokens;
	}

	/**
	 * Get if a word of the expression matches this node only by how it is
	 * spelled, and is itself a word of the graph. Such a word means what the
	 * graph says it means, so it is not read as a misspelling of this word.
	 * Without this `billion` could be read as `million`.
	 *
	 * @param token -
	 *   the token of the expression
	 * @returns
	 *   `true` if the token must not match this node by spelling
	 */
	private isOtherKnownWord(token: Token): boolean {
		return token.normalized !== this.token.normalized
			&& token.stemmed !== this.token.stemmed
			&& this.knownTokens.has(token.normalized);
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
					: (this.isOtherKnownWord(token) ? 0 : this.comparer.compare(this.token, token));

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
