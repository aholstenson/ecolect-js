import {
	addYears,
	addQuarters,
	addWeeks,
	addMonths,
	addDays,
	addHours,
	addMinutes,
	addSeconds,
	addMilliseconds
} from 'date-fns';

import { DateTimeData } from './DateTimeData';

/**
 * Map a duration of time into a usable object.
 */
export function mapDuration(r: DateTimeData): Duration {
	const result = new MutableDuration();
	result.years = r.relativeYears;
	result.quarters = r.relativeQuarters;
	result.weeks = r.relativeWeeks;
	result.months = r.relativeMonths;
	result.days = r.relativeDays;
	result.hours = r.relativeHours;
	result.minutes = r.relativeMinutes;
	result.seconds = r.relativeSeconds;
	result.milliseconds = r.relativeMilliseconds;
	return result;
}

export interface Duration {
	readonly years?: number;
	readonly quarters?: number;
	readonly weeks?: number;
	readonly months?: number;
	readonly days?: number;
	readonly hours?: number;
	readonly minutes?: number;
	readonly seconds?: number;
	readonly milliseconds?: number;
}

export class MutableDuration implements Duration {
	public years?: number;
	public quarters?: number;
	public weeks?: number;
	public months?: number;
	public days?: number;
	public hours?: number;
	public minutes?: number;
	public seconds?: number;
	public milliseconds?: number;

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

	public toDate(time=new Date()) {
		if(typeof this.years !== 'undefined') {
			time = addYears(time, this.years);
		}

		if(typeof this.quarters !== 'undefined') {
			time = addQuarters(time, this.quarters);
		}

		if(typeof this.weeks !== 'undefined') {
			time = addWeeks(time, this.weeks);
		}

		if(typeof this.months !== 'undefined') {
			time = addMonths(time, this.months);
		}

		if(typeof this.days !== 'undefined') {
			time = addDays(time, this.days);
		}

		if(typeof this.hours !== 'undefined') {
			time = addHours(time, this.hours);
		}

		if(typeof this.minutes !== 'undefined') {
			time = addMinutes(time, this.minutes);
		}

		if(typeof this.seconds !== 'undefined') {
			time = addSeconds(time, this.seconds);
		}

		if(typeof this.milliseconds !== 'undefined') {
			time = addMilliseconds(time, this.milliseconds);
		}

		return time;
	}
}
