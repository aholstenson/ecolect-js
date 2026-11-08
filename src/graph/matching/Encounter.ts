import type { Tokens, Token } from '../../tokenization/index.js';
import type { Node } from '../Node.js';

import type { MemoEntry, MemoRecord } from './DominanceMemo.js';
import { DataStackIds, MemoFrame } from './DominanceMemo.js';
import type { EncounterOptions } from './EncounterOptions.js';
import type { MatchPath } from './Match.js';
import { Match, rebaseData } from './Match.js';
import type { MatchHandler } from './MatchHandler.js';
import { MatchSet } from './MatchSet.js';
import type { MaybePromise } from './maybePromise.js';
import { after, isThenable, sequence, toPromise } from './maybePromise.js';
import type { SubGraphEvaluation } from './SubGraphEvaluation.js';

/**
 * Get if a punctuation token in the expression can be skipped. A `-` written
 * right before the next token is a minus sign, as in `-5`, and is not
 * skipped, as `-5` and `5` are different amounts. A `-` with a space after
 * it, as in a list item, can be skipped.
 *
 * @param token -
 *   the token to check
 * @param next -
 *   the token after it, if any
 * @returns
 *   `true` if the token is punctuation that can be skipped
 */
function isSkippablePunctuation(token: Token, next: Token | undefined): boolean {
	if(! token.punctuation) return false;

	return ! (token.normalized === '-' && next && next.start === token.stop);
}

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

	/**
	 * The number of the data stack, from `dataStackIds`, for each length of
	 * the data stack up to `dataIdsKnown`. Numbers are found when they are
	 * needed, as most data stacks are never compared.
	 */
	private dataIds: number[];
	private dataIdsKnown: number;
	private readonly dataStackIds: DataStackIds;

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

	/**
	 * If the expression may continue after the input ends. Set to `false`
	 * while evaluating a branch where the last token of a partial expression
	 * has been skipped.
	 */
	private allowContinuation: boolean;

	private onMatch?: MatchHandler;

	public readonly options: EncounterOptions;

	public outgoing: Node[];

	/**
	 * Caches for each token index, used while the expression may continue
	 * after the input ends.
	 */
	private _cache: Map<any, any>[];

	/**
	 * Caches for each token index, used while the expression may not
	 * continue after the input ends.
	 */
	private _cacheWithoutContinuation: Map<any, any>[];

	/**
	 * Errors from values that could not be matched, such as a remote lookup
	 * that failed. A value with an error does not match. The errors are
	 * reported when nothing else in the graph matched.
	 */
	public readonly errors: Error[];

	/**
	 * Evaluations of sub-graphs that are in progress, in the order they were
	 * started. Used to stop a graph that refers to itself from recursing
	 * forever.
	 */
	private _evaluations: SubGraphEvaluation[];

	/**
	 * Scores of partial word comparisons, for each token index.
	 */
	private partialScores: (Map<object, Map<string, number>> | undefined)[];

	/**
	 * The states of the paths that have been evaluated with the current
	 * match handler.
	 */
	private memoFrame: MemoFrame | null;

	/**
	 * The entries whose nodes are being evaluated, from the outermost to the
	 * innermost.
	 */
	private activeEntries: MemoEntry[];

	/**
	 * If matches found now can reach the result of the encounter, so that
	 * their path must be kept. Matches in a sub-graph go to the sub-graph
	 * and do not need it.
	 */
	private keepPaths: boolean;

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
		this.allowContinuation = true;

		this.options = options;

		this.outgoing = [];
		this._cache = [];
		this._cacheWithoutContinuation = [];
		this._evaluations = [];
		this.errors = [];
		this.partialScores = [];

		this.memoFrame = null;
		this.dataIds = [ 0 ];
		this.dataIdsKnown = 0;
		this.dataStackIds = new DataStackIds();
		this.activeEntries = [];
		this.keepPaths = true;
	}

	/**
	 * Get the scores of partial comparisons of words against the current
	 * token. In a phrase graph many nodes can test the same word against the
	 * same token, and a partial comparison is slow, so each score is kept
	 * for the encounter.
	 *
	 * @param comparer -
	 *   the comparer of the nodes, nodes with the same comparer and word get
	 *   the same score
	 * @returns
	 *   map from the word of a node to its score
	 */
	public partialScoresFor(comparer: object): Map<string, number> {
		let byComparer = this.partialScores[this.currentIndex];
		if(! byComparer) {
			byComparer = new Map();
			this.partialScores[this.currentIndex] = byComparer;
		}

		let scores = byComparer.get(comparer);
		if(! scores) {
			scores = new Map();
			byComparer.set(comparer, scores);
		}

		return scores;
	}

	/**
	 * Record an error from a value that could not be matched. The value does
	 * not match, and the error is reported if nothing else matches.
	 *
	 * @param error -
	 *   the error
	 */
	public reportError(error: Error): void {
		this.errors.push(error);
	}

	/**
	 * Throw the first recorded error. Call this when nothing matched, so
	 * that a failed value is not the same as text that does not match.
	 */
	public throwIfErrors(): void {
		if(this.errors.length > 0) {
			throw this.errors[0];
		}
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

	/**
	 * Get if the expression is allowed to continue after the input ends. This
	 * is true while matching a partial expression, except in branches where
	 * the last token of the input has been skipped.
	 *
	 * @returns
	 *   `true` if more input may follow the tokens in this encounter
	 */
	public get isPartialInput(): boolean {
		return (this.options.partial || false) && this.allowContinuation;
	}

	public get isPartial() {
		return this.isPartialInput && this.supportsPartial;
	}

	/**
	 * Run the given function with the expression not being allowed to continue
	 * after the input ends, so that only matches that are already complete are
	 * reported.
	 *
	 * @param func -
	 *   function to run
	 * @returns
	 *   nothing, via a promise if the function returned a promise
	 */
	public withoutContinuation(func: () => MaybePromise<unknown>): MaybePromise<void> {
		const allowContinuation = this.allowContinuation;
		this.allowContinuation = false;

		return after(func(), () => {
			this.allowContinuation = allowContinuation;
		});
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
	 * @param skipSkippable -
	 *   if a word that may be left out, such as `the`, is also skipped at the
	 *   next index. A free-text value sets this to `false`, as reading more
	 *   text covers the same match.
	 * @returns
	 *   nothing, via a promise if any node returned a promise
	 */
	public advance(score: number, consumedTokens: number, data?: any, skipSkippable: boolean = true): MaybePromise<void> {
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

		/*
		 * Only paths that continue after a node that more than one edge leads
		 * to are compared with earlier paths, see `dominatingEntry`.
		 */
		let entry: MemoEntry | undefined;
		const current = this.currentNodes[this.currentNodes.length - 1];
		if(current !== undefined && current.sharedId >= 0) {
			const found = this.dominatingEntry(current, nextIndex, nextScore, skipSkippable);
			if(found === null) {
				// An earlier path continued in the same state with the same or a better score
				if(pushedData) this.popData();
				return;
			}

			entry = found;
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
			if(pushedData) this.popData();

			/*
			 * If the input token is skippable also evaluate the expression
			 * with the token skipped.
			 *
			 * This is done if:
			 * 1) The token is skippable
			 * 2) The current graph supports fuzzy matching
			 */
			const token = this.token(nextIndex);
			if(skipSkippable && token && this.isSkippable(token) && this.supportsFuzzy) {
				/*
				 * A node that reads any text also reads the skippable word,
				 * so skipping the word for it gives the same match again
				 * with less text. Only the other nodes are evaluated with
				 * the word skipped.
				 */
				const skipNodes = nodes.filter(node => ! node.readsAnyText);
				if(skipNodes.length === 0) return;

				this.outgoing = skipNodes;
				return after(skipToken(token), () => {
					this.outgoing = outgoing;
				});
			}
		};

		/**
		 * Evaluate the expression with the token at the next index skipped.
		 *
		 * @param token -
		 *   the skippable token
		 * @returns
		 *   nothing, via a promise if any node returned a promise
		 */
		const skipToken = (token: Token): MaybePromise<void> => {
			if(this.options.partial && nextIndex === this.tokens.length - 1) {
				/*
				 * The last token of a partial expression is the word that
				 * is being typed. Stop words such as `for` are usually
				 * followed by more input, so leaving them out would suggest
				 * expressions the input has already ruled out. Words the
				 * graph declares skippable, such as `please`, are filler
				 * and may be left out, but the expression may not continue
				 * after them as no more input is going to arrive.
				 */
				if(token.skippable) return;

				return this.withoutContinuation(
					() => this.advance((score || 0), (consumedTokens || 0) + 1, data)
				);
			}

			return this.advance((score || 0), (consumedTokens || 0) + 1, data);
		};

		if(entry) {
			return this.withEntry(entry, () => after(sequence(nodes.length, branchInto), finish));
		}

		return after(sequence(nodes.length, branchInto), finish);
	}

	/**
	 * Find the entry for the state in which the current path continues after
	 * the current node. The state is the node, the token index that the
	 * nodes after it start at, the data that the path pushed and the flags
	 * of the encounter. The nodes after the node give the same matches for
	 * every path that continues in the same state, apart from the score and
	 * the nodes of the path. The score of the path only adds to the score of
	 * these matches, so a path with a lower score gives only matches that
	 * are worse than the matches of the earlier path, and they are thrown
	 * away.
	 *
	 * A path with the same score gives the same matches again, through other
	 * nodes. It is also removed, and the matches of the earlier path are
	 * added again for its nodes, see `replayRecords`.
	 *
	 * @param node -
	 *   the current node, which more than one edge leads to
	 * @param nextIndex -
	 *   the token index that the nodes after the current node start at
	 * @param nextScore -
	 *   the score of the path when it continues
	 * @param skipSkippable -
	 *   if a skippable word at the next index is also skipped
	 * @returns
	 *   the entry to continue with, `undefined` to continue without an entry,
	 *   or `null` if the path can be removed
	 */
	private dominatingEntry(node: Node, nextIndex: number, nextScore: number, skipSkippable: boolean): MemoEntry | undefined | null {
		/*
		 * The nodes after a node that more than one edge leads to are where
		 * paths that met continue in the same way. A node that branches into
		 * other nodes than the nodes after it, such as a sub-graph or a
		 * skipped word, is not looked up.
		 */
		if(this.outgoing !== node.outgoing) {
			return undefined;
		}

		this.memoFrame ??= new MemoFrame();
		const frame = this.memoFrame;
		const entry = frame.find(
			node.sharedId,
			(nextIndex * 2) + (skipSkippable ? 1 : 0),
			this.allowContinuation,
			this.currentDataId(),
			nextScore
		);
		if(! entry) return entry;
		if(frame.created) {
			entry.depth = this.currentNodes.length;
			return entry;
		}

		/*
		 * The same state can only be reached again while it is evaluated if
		 * the graph has a loop that reads nothing. Such a path is evaluated
		 * as before.
		 */
		if(entry.active > 0) return undefined;

		let dominated;
		let same;
		if(entry.cutOff && this.options.partial) {
			// The matches a value keeps depend on the score, see `MemoEntry.cutOff`
			same = nextScore === entry.walkScore
				|| (entry.walkScores !== null && entry.walkScores.has(nextScore));
			dominated = same;
		} else {
			same = nextScore === entry.score;
			dominated = nextScore <= entry.score;
		}
		if(dominated) {
			if(entry.seedUses) {
				for(const evaluation of entry.seedUses) {
					if(this._evaluations.includes(evaluation)) {
						this.useSeed(evaluation);
					}
				}
			}

			if(same && ! this.onMatch && entry.records) {
				this.replayRecords(entry.records, nextScore);
			}

			return null;
		}

		if(entry.cutOff) {
			entry.walkScores ??= new Set();
			const scores = entry.walkScores;
			scores.add(entry.walkScore);
		}

		entry.score = Math.max(entry.score, nextScore);
		entry.walkScore = nextScore;
		entry.depth = this.currentNodes.length;
		return entry;
	}

	/**
	 * Record that a value dropped some of its matches as it keeps only the
	 * best ones. See `MemoEntry.cutOff`.
	 */
	public reportCutOff(): void {
		for(const entry of this.activeEntries) {
			entry.cutOff = true;
		}
	}

	/**
	 * Get the number of the current data stack. Numbers of the stacks below
	 * it that are not known yet are found first.
	 *
	 * @returns
	 *   the number of the stack
	 */
	private currentDataId(): number {
		const ids = this.dataIds;
		const ofStacks = this.dataStackIds;
		const length = this.currentData.length;
		for(let i=this.dataIdsKnown+1; i<=length; i++) {
			// The stack with length i has the item at i - 1 on top
			ids[i] = ofStacks.push(ids[i - 1], this.currentData[i - 1]);
		}

		this.dataIdsKnown = length;
		return ids[length];
	}

	/**
	 * Remove the top item of the data stack.
	 */
	private popData(): void {
		this.currentData.pop();

		// The number of a stack with an item on this place is no longer known
		if(this.dataIdsKnown > this.currentData.length) {
			this.dataIdsKnown = this.currentData.length;
		}
	}

	/**
	 * Run the given function while the given entry is marked as being
	 * evaluated.
	 *
	 * @param entry -
	 *   the entry of the state the path continues in
	 * @param func -
	 *   the function that evaluates the nodes after the current node
	 * @returns
	 *   nothing, via a promise if the function returned a promise
	 */
	private withEntry(entry: MemoEntry, func: () => MaybePromise<void>): MaybePromise<void> {
		entry.active++;
		this.activeEntries.push(entry);

		let result;
		try {
			result = func();
		} catch(err) {
			entry.active--;
			this.activeEntries.pop();
			throw err;
		}

		if(isThenable(result)) {
			return result.then(() => {
				entry.active--;
				this.activeEntries.pop();
			}, err => {
				entry.active--;
				this.activeEntries.pop();
				throw err;
			});
		}

		entry.active--;
		this.activeEntries.pop();
		return result;
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
	 * @param isolateData -
	 *   if collectors in the branch see only the data pushed in the branch.
	 *   Use `true` for a sub-graph, which has its own collectors. Use `false`
	 *   when the branch continues in the same graph, so that its collectors
	 *   also see the data pushed before the branch.
	 * @returns
	 *   nothing, via a promise if the function returned a promise
	 */
	public branchWithOnMatch(
		newOnMatch: MatchHandler,
		func: () => MaybePromise<unknown>,
		isolateData: boolean = true
	): MaybePromise<void> {
		const onMatch = this.onMatch;
		const currentDataDepth = this.currentDataDepth;
		const memoFrame = this.memoFrame;
		const keepPaths = this.keepPaths;
		this.onMatch = newOnMatch;
		if(isolateData) {
			this.currentDataDepth = this.currentData.length;

			// Matches of a sub-graph go to the sub-graph, not to the result
			this.keepPaths = false;
		}

		/*
		 * Matches in the branch go to another handler, so paths in the branch
		 * are only compared with each other. The frame is created when it is
		 * first used.
		 */
		this.memoFrame = null;

		return after(func(), () => {
			this.currentDataDepth = currentDataDepth;
			this.onMatch = onMatch;
			this.memoFrame = memoFrame;
			this.keepPaths = keepPaths;
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
		while(token && isSkippablePunctuation(token, this.tokens[index + 1])) {
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
		while(token && isSkippablePunctuation(token, this.tokens[idx + 1])) {
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
			/*
			 * The path is only needed to add the match again for another
			 * path, which can only happen while a state is evaluated.
			 */
			if(this.keepPaths && this.activeEntries.length > 0) {
				match.path = {
					nodes: this.currentNodes.slice(),
					tokens: this.currentTokens.slice(),
					index: this.currentIndex
				};
			}
		}

		if(this.onMatch) {
			return this.onMatch(match);
		} else {
			if(this.onlyComplete && match.index < this.tokens.length) {
				// Skip this match unless it has consumed all tokens
				return;
			}

			if(this.matches.add(match) && this.activeEntries.length > 0) {
				this.recordMatch(match);
			}
		}
	}

	/**
	 * Record a match that was added to the result in every state that is
	 * being evaluated. Only the last match of each kind is kept.
	 *
	 * @param match -
	 *   the match
	 */
	private recordMatch(match: Match<any>): void {
		/*
		 * The result kept one match for each kind, so the match it replaced
		 * is the earlier match of the same kind.
		 */
		const replaced = this.matches.replaced;
		for(const entry of this.activeEntries) {
			entry.records ??= [];
			const records = entry.records;
			if(replaced) {
				for(let i=0; i<records.length; i++) {
					if(records[i].match === replaced) {
						records.splice(i, 1);
						break;
					}
				}
			}

			records.push({ match: match, depth: entry.depth, score: entry.walkScore });
		}
	}

	/**
	 * Add the matches of an earlier path again, as the current path gives
	 * them. The current path reached the same state with the same score as
	 * the earlier path, so it gives the same matches through other nodes.
	 * The result keeps the last of two equal matches with the same score,
	 * and so it keeps the matches of the current path. Matches that the
	 * result no longer keeps are left out, as the current path does not
	 * change them.
	 *
	 * @param records -
	 *   the matches the earlier paths added
	 * @param score -
	 *   the score of the current path, only matches of an earlier path with
	 *   this score are added again
	 */
	private replayRecords(records: readonly MemoRecord[], score: number): void {
		const prefixNodes = this.currentNodes;
		const prefixTokens = this.currentTokens;
		for(const record of records.slice()) {
			if(record.score !== score) continue;

			const match = record.match;
			const kept = this.matches.has(match) ? match : this.matches.findEqual(match.data);
			if(! kept || kept.score !== match.score || ! match.path) continue;

			const path: MatchPath = {
				nodes: [ ...prefixNodes, ...match.path.nodes.slice(record.depth) ],
				tokens: [ ...prefixTokens, ...match.path.tokens.slice(record.depth) ],
				index: match.path.index
			};

			const data: any = match.data;
			const rebased = new Match(
				match.index,
				typeof data?.[rebaseData] === 'function' ? data[rebaseData](path, this) : data,
				{ ...match.scoreData }
			);
			rebased.path = path;

			if(this.matches.add(rebased) && this.activeEntries.length > 0) {
				this.recordMatch(rebased);
			}
		}
	}

	/**
	 * Get a map that can be used to cache things during the evaluation of
	 * a graph. This is used by sub-nodes to cache their results based on the
	 * start index.
	 *
	 * A sub-graph can find different results at the same index when the
	 * expression may continue after the input ends and when it may not, for
	 * example when the last word of a partial expression is skipped. Each of
	 * the two states has its own caches, so a result found in one state is
	 * never used in the other.
	 *
	 * @param index -
	 *   the token index, defaults to the current index
	 * @returns
	 *   the cache for the index and the current continuation state
	 */
	public cache(index=this.currentIndex): Map<any, any> {
		const caches = this.allowContinuation ? this._cache : this._cacheWithoutContinuation;

		let map = caches[index];
		if(map) return map;

		map = new Map();
		caches[index] = map;
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

		/*
		 * Only entries that started after the evaluation can be reached again
		 * while the evaluation is in progress.
		 */
		const entries = this.activeEntries;
		for(let i=evaluation.activeEntries ?? 0; i<entries.length; i++) {
			const entry = entries[i];
			if(! entry.seedUses) entry.seedUses = new Set();
			entry.seedUses.add(evaluation);
		}

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
			seedByIndex: new Map(),
			delta: [],
			seedUsed: false,
			seedRoots: new Set(),
			dependsOnSeed: false,
			activeEntries: this.activeEntries.length
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
