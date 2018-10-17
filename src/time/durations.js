import addYears from 'date-fns/addYears';
import addQuarters from 'date-fns/addQuarters';
import addWeeks from 'date-fns/addWeeks';
import addMonths from 'date-fns/addMonths';
import addDays from 'date-fns/addDays';
import addHours from 'date-fns/addHours';
import addMinutes from 'date-fns/addMinutes';
import addSeconds from 'date-fns/addSeconds';
import addMilliseconds from 'date-fns/addMilliseconds';

/**
 * Map a duration of time into a usable object.
 */
export function map(r) {
	const result = new Duration();
	result.years = r.relativeYears || 0;
	result.quarters = r.relativeQuarters || 0;
	result.weeks = r.relativeWeeks || 0;
	result.months = r.relativeMonths || 0;
	result.days = r.relativeDays || 0;
	result.hours = r.relativeHours || 0;
	result.minutes = r.relativeMinutes || 0;
	result.seconds = r.relativeSeconds || 0;
	result.milliseconds = r.relativeMilliseconds || 0;
	return result;
}

class Duration {
	constructor() {
		this.years = 0;
		this.quarters = 0;
		this.weeks = 0;
		this.months = 0;
		this.days = 0;
		this.hours = 0;
		this.minutes = 0;
		this.seconds = 0;
		this.milliseconds = 0;
	}

	toDate(time=new Date()) {
		time = addYears(time, this.years);
		time = addQuarters(time, this.quarters);
		time = addWeeks(time, this.weeks);
		time = addMonths(time, this.months);
		time = addDays(time, this.days);
		time = addHours(time, this.hours);
		time = addMinutes(time, this.minutes);
		time = addSeconds(time, this.seconds);
		time = addMilliseconds(time, this.milliseconds);
		return time;
	}
}
