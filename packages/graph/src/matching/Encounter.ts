import { Tokens, Token } from '@ecolect/tokenization';

import { Match } from './Match.js';
import { MatchSet } from './MatchSet.js';
import { Node } from '../Node.js';

import { EncounterOptions } from './EncounterOptions.js';
import { MatchHandler } from './MatchHandler.js';
import { MaybePromise, after, isThenable, sequence, toPromise } from './maybePromise.js';
import { SubGraphEvaluation } from './SubGraphEvaluation.js';

/**
 * Set used when a graph does not declare any extra skippable tokens.
 */
export const NO_SKIPPABLE_TOKENS: ReadonlySet<string> = new Set();

/**
 * Encounter used when trying to match an expression. Contains all the tokens
 * and functions for accessing tokens, the current index and the current
 * score.
 */
export class Encounter {
	/**
	 * Tokens that this encounter is working through.
	 */
	public tokens: Tokens;

	public currentIndex: number;
	public currentScore: number;
	public currentNodes: Node[];
	public currentTokens: number[];
	private currentData: any[];
	private currentDataDepth: number;

	public matches: MatchSet<any>;

	private onlyComplete: boolean;

	public skipPunctuation: boolean;

	public supportsPartial: boolean;
	public supportsFuzzy: boolean;

	/**
	 * Normalized tokens that the graph being evaluated allows to be left out,
	 * in addition to the ones the tokenizer has marked as skippable.
	 */
	public skippableTokens: ReadonlySet<string>;

	private onMatch?: MatchHandler;

	public readonly options: EncounterOptions;

	public outgoing: Node[];
	private _cache: Map<any, any>[];

	/**
	 * Evaluations of sub-graphs that are in progress, in the order they were
	 * started. Used to stop a graph that refers to itself from recursing
	 * forever.
	 */
	private _evaluations: SubGraphEvaluation[];

	public constructor(tokens: Tokens, options: EncounterOptions) {
		this.tokens = tokens;

		this.currentIndex = 0;
		this.currentScore = 0;
		this.currentNodes = [];
		this.currentTokens = [];
		this.currentData = [];
		this.currentDataDepth = 0;
		this.matches = new MatchSet({
			isEqual: options.matchIsEqual && options.matchIsEqual(options)
		});

		this.onMatch = options.onMatch;
		this.onlyComplete = options.onlyComplete || false;
		this.skipPunctuation = options.skipPunctuation || false;
		this.supportsPartial = options.supportsPartial || false;
		this.supportsFuzzy = options.supportsFuzzy || false;
		this.skippableTokens = options.skippableTokens || NO_SKIPPABLE_TOKENS;

		this.options = options;

		this.outgoing = [];
		this._cache = [];
		this._evaluations = [];
	}

	/**
	 * Get the token at the given index, or at the current index.
	 */
	public token(index: number = this.currentIndex): Token {
		return this.tokens[index];
	}

	/**
	 * Get if the given token may be left out. Tokens are skippable either
	 * because the tokenizer marked them as such, or because the graph being
	 * evaluated declared them skippable.
	 *
	 * @param token -
	 *   the token to check
	 * @returns
	 *   `true` if the token may be left out
	 */
	public isSkippable(token: Token): boolean {
		return token.skippable || this.skippableTokens.has(token.normalized);
	}

	public get hasMoreTokens() {
		return this.currentIndex < this.tokens.length - 1;
	}

	public get isLastToken() {
		return this.currentIndex === this.tokens.length - 1;
	}

	public get isJustAfterLastToken() {
		return this.currentIndex === this.tokens.length;
	}

	public get isFuzzy() {
		return this.options.fuzzy && this.supportsFuzzy;
	}

	public get isPartial() {
		return this.options.partial && this.supportsPartial;
	}

	public data() {
		return this.currentDataDepth > 0
			? this.currentData.slice(this.currentDataDepth)
			: this.currentData;
	}

	/**
	 * Branch out this encounter and try to match all of the given nodes.
	 * This is the same as `advance` but always returns a promise, for nodes
	 * that prefer to work with promises.
	 *
	 * @param score -
	 *   score to add for the tokens consumed
	 * @param consumedTokens -
	 *   the number of tokens consumed
	 * @param data -
	 *   optional data to make available to collectors
	 * @returns
	 *   promise that resolves when all outgoing nodes have been evaluated
	 */
	public next(score: number, consumedTokens: number, data?: any): Promise<void> {
		try {
			return toPromise(this.advance(score, consumedTokens, data));
		} catch(err) {
			return Promise.reject(err);
		}
	}

	/**
	 * Branch out this encounter and try to match all of the given nodes.
	 *
	 * For every outgoing node:
	 *   - Run the match method, checking if it matches
	 *
	 * The nodes are evaluated one after the other. Evaluation is synchronous
	 * until a node returns a promise, in which case the remaining nodes are
	 * evaluated when the promise resolves.
	 *
	 * @param score -
	 *   score to add for the tokens consumed
	 * @param consumedTokens -
	 *   the number of tokens consumed
	 * @param data -
	 *   optional data to make available to collectors
	 * @returns
	 *   nothing, via a promise if any node returned a promise
	 */
	public advance(score: number, consumedTokens: number, data?: any): MaybePromise<void> {
		const nextIndex = this.currentIndex + (consumedTokens || 0);
		const nextScore = this.currentScore + (score || 0);

		/*
		 * Read past any punctuation to find the index the next node starts
		 * matching at. This must not move `currentIndex`, as that is the index
		 * every branch is restored to when it has been evaluated.
		 */
		const nextIndexAfterPunctuation = this.skipPunctuation
			? this.afterPunctuation(nextIndex)
			: nextIndex;

		let pushedData = false;
		if(data !== null && typeof data !== 'undefined') {
			pushedData = true;
			this.currentData.push(data);
		}

		const currentIndex = this.currentIndex;
		const currentScore = this.currentScore;
		const outgoing = this.outgoing;
		const nodes = this.outgoing;

		const restore = () => {
			this.currentIndex = currentIndex;
			this.currentScore = currentScore;

			this.outgoing = outgoing;
			this.currentNodes.pop();
			this.currentTokens.pop();
		};

		/**
		 * Evaluate the node at the given index.
		 *
		 * @param i -
		 *   index of the node in `nodes`
		 * @returns
		 *   nothing, via a promise if the node returned a promise
		 */
		const branchInto = (i: number): MaybePromise<unknown> => {
			const node = nodes[i];

			// Switch to the next index and score
			this.currentIndex = node.supportsPunctuation ? nextIndex : nextIndexAfterPunctuation;
			this.currentScore = nextScore;

			this.currentNodes.push(node);
			this.currentTokens.push(this.currentIndex);

			// Swap the nodes being used
			this.outgoing = node.outgoing;

			// Match the result
			const result = node.match(this);

			if(isThenable(result)) {
				// If the match returned a promise chain the reset
				return result.then(restore);
			} else {
				// If the result was not a promise reset directly
				restore();
			}
		};

		const finish = (): MaybePromise<void> => {
			if(pushedData) this.currentData.pop();

			/*
			 * If the input token is skippable also evaluate the expression
			 * with the token skipped.
			 *
			 * This is done if:
			 * 1) The token is skippable
			 * 2) The current graph supports fuzzy matching
			 * 3) The token is not the last one
			 */
			const token = this.token(nextIndex);
			if(token && this.isSkippable(token)
				&& this.supportsFuzzy
				&& nextIndex !== this.tokens.length - 1
			) {
				return this.advance((score || 0), (consumedTokens || 0) + 1, data);
			}
		};

		return after(sequence(nodes.length, branchInto), finish);
	}

	/**
	 * Branch into and evaluate the expression against the given nodes.
	 *
	 * @param nodes -
	 *   the nodes to evaluate
	 * @returns
	 *   nothing, via a promise if any node returned a promise
	 */
	public branchInto(nodes: Node[]): MaybePromise<void> {
		const outgoing = this.outgoing;
		this.outgoing = nodes;
		return after(this.advance(0, 0), () => {
			this.outgoing = outgoing;
		});
	}

	/**
	 * Run the given function with matches being reported to the given
	 * handler instead of being added to the result.
	 *
	 * @param newOnMatch -
	 *   handler that receives the matches
	 * @param func -
	 *   function to run
	 * @returns
	 *   nothing, via a promise if the function returned a promise
	 */
	public branchWithOnMatch(newOnMatch: MatchHandler, func: () => MaybePromise<unknown>): MaybePromise<void> {
		const onMatch = this.onMatch;
		const currentDataDepth = this.currentDataDepth;
		this.onMatch = newOnMatch;
		this.currentDataDepth = this.currentData.length;

		return after(func(), () => {
			this.currentDataDepth = currentDataDepth;
			this.onMatch = onMatch;
		});
	}

	/**
	 * Get the index of the first token at or after the given index that is
	 * not punctuation.
	 *
	 * @param index -
	 *   the index to start looking at
	 * @returns
	 *   the index of the first token that is not punctuation
	 */
	public afterPunctuation(index: number): number {
		let token = this.tokens[index];
		while(token && token.punctuation) {
			token = this.tokens[++index];
		}
		return index;
	}

	/**
	 * Read any punctuation we can, moving the current index past it.
	 */
	public readPunctuation() {
		this.currentIndex = this.afterPunctuation(this.currentIndex);
	}

	/**
	 * Get the index of the first non-skipped token.
	 *
	 * This looks backwards in the tokens to try to find the first
	 * non-punctuation token. Used by SubNodes to allow puncutation to be
	 * used both the parent parser and the sub-parser.
	 *
	 * @param index -
	 *   the index to look backwards from, defaults to the current index
	 * @returns
	 *   the index just after the last token that is not punctuation
	 */
	public previousNonSkipped(index: number = this.currentIndex): number {
		if(! this.skipPunctuation) return index;

		let idx = index - 1;
		let token = this.tokens[idx];
		while(token && token.punctuation) {
			token = this.tokens[--idx];
		}
		return idx + 1;
	}

	public remainingTokens() {
		return this.tokens.slice(this.currentIndex);
	}

	/**
	 * Push the current match onto the result.
	 *
	 * @param data -
	 *   the data matched, or a match to report as is
	 * @returns
	 *   nothing, via a promise if the match handler returned a promise
	 */
	public match(data: any): MaybePromise<unknown> {
		let match;
		if(data instanceof Match) {
			match = data;
		} else {
			const scoreData = {
				partial: this.options.partial || false,
				tokens: this.tokens.length,
				depth: this.currentIndex,
				score: this.currentScore
			};

			match = new Match(this.currentIndex, data, scoreData);
		}

		if(this.onMatch) {
			return this.onMatch(match);
		} else {
			if(this.onlyComplete && match.index < this.tokens.length) {
				// Skip this match unless it has consumed all tokens
				return;
			}

			this.matches.add(match);
		}
	}

	/**
	 * Get a map that can be used to cache things during the evaluation of
	 * a graph. This is used by sub-nodes to cache their results based on the
	 * start index.
	 *
	 * @param index
	 */
	public cache(index=this.currentIndex): Map<any, any> {
		let map = this._cache[index];
		if(map) return map;

		map = new Map();
		this._cache[index] = map;
		return map;
	}

	/**
	 * Get the evaluation of the given sub-graph if it is in progress at the
	 * current index. Sub-graphs that refer to themselves use this to find
	 * the seed to use instead of recursing.
	 *
	 * @param roots -
	 *   the root nodes of the sub-graph
	 * @returns
	 *   the evaluation in progress, or `undefined` if the sub-graph is not
	 *   being evaluated at the current index
	 */
	public evaluationOf(roots: Node[]): SubGraphEvaluation | undefined {
		const evaluations = this._evaluations;
		for(let i=evaluations.length-1; i>=0; i--) {
			const evaluation = evaluations[i];
			if(evaluation.roots === roots && evaluation.index === this.currentIndex) {
				return evaluation;
			}
		}

		return undefined;
	}

	/**
	 * Mark that the seed of the given evaluation is being used, which happens
	 * when the sub-graph refers to itself. Evaluations that started after
	 * the given one are marked as depending on the seed, as their result may
	 * change when the seed grows.
	 *
	 * @param evaluation -
	 *   the evaluation whose seed is used
	 */
	public useSeed(evaluation: SubGraphEvaluation): void {
		evaluation.seedUsed = true;
		evaluation.seedRoots.add(this.currentNodes[evaluation.depth]);

		const evaluations = this._evaluations;
		for(let i=evaluations.length-1; i>=0; i--) {
			const other = evaluations[i];
			if(other === evaluation) break;

			other.dependsOnSeed = true;
		}
	}

	/**
	 * Start evaluating the given sub-graph at the current index.
	 *
	 * @param roots -
	 *   the root nodes of the sub-graph
	 * @returns
	 *   the evaluation, to be passed to `stopEvaluating` when done
	 */
	public startEvaluating(roots: Node[]): SubGraphEvaluation {
		const evaluation: SubGraphEvaluation = {
			roots: roots,
			index: this.currentIndex,
			depth: this.currentNodes.length,
			seed: [],
			seedUsed: false,
			seedRoots: new Set(),
			dependsOnSeed: false
		};

		this._evaluations.push(evaluation);
		return evaluation;
	}

	/**
	 * Mark the given evaluation as done.
	 *
	 * @param evaluation -
	 *   the evaluation returned by `startEvaluating`
	 */
	public stopEvaluating(evaluation: SubGraphEvaluation): void {
		const evaluations = this._evaluations;
		const idx = evaluations.lastIndexOf(evaluation);
		if(idx >= 0) {
			evaluations.splice(idx, 1);
		}
	}
}
