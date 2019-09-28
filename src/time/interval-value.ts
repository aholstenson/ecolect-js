import { toStart, toEnd } from './intervals';
import { fromDate } from './fromDate';
import { DateValue } from './date-value';
import { Period } from './period';

export class IntervalValue {
	public start?: DateValue;
	public end?: DateValue;

	constructor(start?: Date | DateValue, end?: Date | DateValue) {
		this.start = start instanceof Date ? fromDate(start) : start;
		this.end = end instanceof Date ? fromDate(end) : end;
	}

	public toStartDate() {
		return this.start ? toStart(this.start.toDate(), this.start.period || Period.Second) : null;
	}

	public toEndDate() {
		return this.end ? toStart(this.end.toDate(), this.end.period || Period.Second) : null;
	}
}
