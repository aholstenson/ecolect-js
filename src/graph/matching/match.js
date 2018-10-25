import { clone } from '../../utils/cloning';

export default class Match {
	constructor(index, data, scoreData) {
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

	copy() {
		return new Match(this.index, clone(this.data), clone(this.scoreData));
	}
}

/**
 * Perform partial scoring. Currently implemented so that shorter graph "depth"
 * scores higher with a normalized score added to differentiate between hits
 * at the same depth.
 */
function scorePartial(scoreData) {
	return 1 / scoreData.depth + scoreData.score / scoreData.depth;
}

/**
 * Normal
 */
function scoreNormal(scoreData) {
	return scoreData.score / scoreData.tokens;
}
