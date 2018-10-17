'use strict';

const { clone } = require('../../utils/cloning');


module.exports.Match = class Match {
	constructor(index, score, data) {
		this.index = index;
		this.score = score;
		this.data = data;
	}

	copy() {
		return new Match(this.index, this.score, clone(this.data));
	}
};
