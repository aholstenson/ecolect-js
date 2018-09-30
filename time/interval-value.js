'use strict';

const { toStart, toEnd } = require('./intervals');

module.exports = class IntervalValue {
	constructor(start, end) {
		this.start = start;
		this.end = end;
	}

	toStartDate() {
		return toStart(this.start);
	}

	toEndDate() {
		return toEnd(this.end);
	}
};
