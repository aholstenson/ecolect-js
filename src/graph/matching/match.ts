import { clone } from '../../utils/cloning';

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

	constructor(index: number, data: V, scoreData: ScoreData) {
		this.index = index;
		this.scoreData = scoreData;
		this.data = data;
	}

	get score() {
		if(this.scoreData.partial) {
			return scorePartial(this.scoreData);
		} else {
			return scoreNormal(this.scoreData);
		}
	}

	public copy() {
		return new Match(this.index, clone(this.data), clone(this.scoreData));
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
 * Normal
 */
function scoreNormal(scoreData: ScoreData) {
	return scoreData.score / scoreData.tokens;
}
