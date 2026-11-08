import rfdc from 'rfdc';

const clone = rfdc();

/**
 * Symbol for a method that copies the data of a match. Data that has this
 * method is copied with it when the match is copied. Other data is copied
 * deeply, which makes class instances in it into plain objects.
 */
export const cloneData = Symbol('cloneData');

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
		return new Match<V>(
			this.index,
			typeof data?.[cloneData] === 'function' ? data[cloneData]() : clone(this.data),
			clone(this.scoreData)
		);
	}
}

/**
 * Perform partial scoring. Currently implemented so that shorter graph "depth"
 * scores higher with a normalized score added to differentiate between hits
 * at the same depth.
 */
function scorePartial(scoreData: ScoreData) {
	return 1 / scoreData.depth + scoreData.score / scoreData.depth;
}

/**
 * Perform normal scoring, which is the score for each token of the
 * expression. An expression without tokens scores 0.
 */
function scoreNormal(scoreData: ScoreData) {
	return scoreData.tokens > 0 ? scoreData.score / scoreData.tokens : 0;
}
