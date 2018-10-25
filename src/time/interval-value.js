import { toStart, toEnd } from './intervals';
import fromDate from './fromDate';

export default class IntervalValue {
	constructor(start, end) {
		this.start = start instanceof Date ? fromDate(start) : start;
		this.end = end instanceof Date ? fromDate(end) : end;
	}

	toStartDate() {
		return toStart(this.start);
	}

	toEndDate() {
		return toEnd(this.end);
	}
}
