import { clone } from '../../utils/cloning';

export default class Match {
	constructor(index, score, data) {
		this.index = index;
		this.score = score;
		this.data = data;
	}

	copy() {
		return new Match(this.index, this.score, clone(this.data));
	}
}
