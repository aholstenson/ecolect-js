import { clone } from '../../utils/cloning';

export default class Match {
	constructor(index, score, data) {
		this.index = index;
		this.score = score;
		this.data = data;
	}

	isPartialData() {
		return this.data === Match.PARTIAL;
	}

	copy() {
		return new Match(this.index, this.score, clone(this.data));
	}
}

Match.PARTIAL = '##PARTIAL##';
