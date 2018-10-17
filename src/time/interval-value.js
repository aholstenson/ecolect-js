import { toStart, toEnd } from './intervals';

export default class IntervalValue {
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
}
