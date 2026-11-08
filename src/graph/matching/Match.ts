import rfdc from 'rfdc';

import type { Node } from '../Node.js';

const clone = rfdc();

/**
 * Symbol for a method that copies the data of a match. Data that has this
 * method is copied with it when the match is copied. Other data is copied
 * deeply, which makes class instances in it into plain objects.
 */
export const cloneData = Symbol('cloneData');

/**
 * Symbol for a method that gives the data of a match as another path would
 * have given it. The method gets the `MatchPath` of the other path and the
 * encounter. Data that does not have this method is the same for every path.
 */
export const rebaseData = Symbol('rebaseData');

/**
 * The path through the graph that gave a match.
 */
export interface MatchPath {
	/**
	 * The nodes of the path, in order.
	 */
	readonly nodes: readonly Node[];

	/**
	 * The token index at each node of the path.
	 */
	readonly tokens: readonly number[];

	/**
	 * The token index when the match was found.
	 */
	readonly index: number;
}

export interface ScoreData {
	partial: boolean;

	depth: number;

	score: number;

	tokens: number;
}

export class Match<V> {
	public index: number;
	public data: V;
	public scoreData: ScoreData;

	/**
	 * The path that gave the match. Only kept while a later path can reuse
	 * the match, see `Encounter.replayRecords`.
	 */
	public path?: MatchPath;

	public constructor(index: number, data: V, scoreData: ScoreData) {
		this.index = index;
		this.scoreData = scoreData;
		this.data = data;
	}

	public get score() {
		if(this.scoreData.partial) {
			return scorePartial(this.scoreData);
		} else {
			return scoreNormal(this.scoreData);
		}
	}

	public copy() {
		const data = this.data as any;
		const result = new Match<V>(
			this.index,
			typeof data?.[cloneData] === 'function' ? data[cloneData]() : clone(this.data),
			clone(this.scoreData)
		);
		result.path = this.path;
		return result;
	}
}

/**
 * Perform partial scoring. Currently implemented so that shorter graph "depth"
 * scores higher with a normalized score added to differentiate between hits
 * at the same depth. A match that read no tokens, such as a value that the
 * empty expression ends before, has the score of a match with depth 1.
 */
function scorePartial(scoreData: ScoreData) {
	const depth = Math.max(scoreData.depth, 1);
	return (1 / depth) + (scoreData.score / depth);
}

/**
 * Perform normal scoring, which is the score for each token of the
 * expression. An expression without tokens scores 0.
 */
function scoreNormal(scoreData: ScoreData) {
	return scoreData.tokens > 0 ? scoreData.score / scoreData.tokens : 0;
}
