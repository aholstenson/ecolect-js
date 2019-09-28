import {
	addYears,
	addQuarters,
	addWeeks,
	addMonths,
	addDays,

	setDay,
	getDay,

	setWeek,
	getWeek,

	setQuarter,
	getQuarter,

	setYear,
	setMonth,
	setDate,

	startOfYear,
	startOfQuarter,
	startOfWeek,
	startOfMonth
} from 'date-fns';

import { DateTimeEncounter } from './encounter';
import { DateTimeData } from './date-time-data';
import { DateTimeOptions } from './options';
import { MutableDateValue } from './date-value';

import { TimeRelationship } from './relationship';
import { Period } from './period';
import { IntervalEdge } from './edge';

import { currentTime } from './currentTime';
import { toStart, toEnd } from './intervals';
import { combine } from './matching';
import { Weekday } from './weekday';

export function today(r: any, e: DateTimeEncounter) {
	const time = currentTime(e.options);
	return {
		day: time.getDate(),
		month: time.getMonth(),
		year: time.getFullYear()
	};
}

export function tomorrow(r: any, e: DateTimeEncounter) {
	const time = addDays(currentTime(e.options), 1);
	return {
		day: time.getDate(),
		month: time.getMonth(),
		year: time.getFullYear()
	};
}

export function dayAfterTomorrow(r: any, e: DateTimeEncounter) {
	const time = addDays(currentTime(e.options), 2);
	return {
		day: time.getDate(),
		month: time.getMonth(),
		year: time.getFullYear()
	};
}

export function yesterday(r: any, e: DateTimeEncounter) {
	const time = addDays(currentTime(e.options), -1);
	return {
		day: time.getDate(),
		month: time.getMonth(),
		year: time.getFullYear()
	};
}

export function withDay(r: DateTimeData, day: number) {
	return combine(r, {
		day: day
	});
}

export function withYear(r: DateTimeData, year: number) {
	return combine(r, {
		year: year < 1000 ? year + 2000 : year
	});
}

export function nextDayOfWeek(day: Weekday) {
	return { dayOfWeek: day };
}

interface Adjustment {
	getField: (o: DateTimeData) => number;

	get: (date: Date, options?: DateTimeOptions) => number;
	set: (date: Date, v: number, options?: DateTimeOptions) => Date;

	adjuster: (date: Date, v: number, options?: DateTimeOptions) => Date;
	parentData: (r: DateTimeData) => boolean;
}

const QUARTER: Adjustment = {
	getField: o => o.quarter || 0,

	get: getQuarter,
	set: setQuarter,

	adjuster: addYears,
	parentData: r => typeof r.year !== 'undefined'
};

const WEEK: Adjustment = {
	getField: o => o.week || 0,

	get: getWeek,
	set: setWeek,

	adjuster: addYears,
	parentData: r => typeof r.year !== 'undefined'
};

const MONTH: Adjustment = {
	getField: o => o.month || 0,

	get: d => d.getMonth(),
	set: setMonth,

	adjuster: addYears,
	parentData: r => typeof r.year !== 'undefined'
};

const DAY: Adjustment = {
	getField: o => o.day || 0,

	get: d => d.getDate(),
	set: setDate,

	adjuster: addMonths,
	parentData: r => typeof r.year !== 'undefined' || typeof r.month !== 'undefined'
};

/**
 * Adjust the current time based on a field. Implements different strategies
 * such as automatic, which tries to adjust the field forward if it's in the
 * past.
 *
 * @param {Date} time
 *   the current time
 * @param {Object} r
 *   the object containing the data
 * @param {*} def
 *   definition describing the field to modify
 */
function adjust(r: DateTimeData, options: DateTimeOptions, time: Date, def: Adjustment) {
	const requested = def.getField(r);
	const current = def.get(time, options);

	if(r.relationToCurrent === TimeRelationship.Auto) {
		if(requested < current) {
			time = def.set(def.adjuster(time, 1, options), requested, options);
		} else {
			time = def.set(time, requested, options);
		}
	} else if(r.relationToCurrent === TimeRelationship.CurrentPeriod) {
		if(def.parentData(r) && requested < current) {
			time = def.set(def.adjuster(time, 1, options), requested, options);
		} else {
			time = def.set(time, requested, options);
		}
	} else if(r.relationToCurrent === TimeRelationship.Future) {
		if(requested <= current) {
			time = def.set(def.adjuster(time, 1, options), requested, options);
		} else {
			time = def.set(time, requested, options);
		}
	} else if(r.relationToCurrent === TimeRelationship.Past) {
		if(requested >= current) {
			time = def.set(def.adjuster(time, -1, options), requested, options);
		} else {
			time = def.set(time, requested, options);
		}
	}

	return time;
}

export function map(r: DateTimeData, e: DateTimeEncounter, options: DateTimeOptions={}): MutableDateValue | null {
	if(! r.relationToCurrent) {
		r.relationToCurrent = TimeRelationship.Auto;
	}

	// Resolve the current time for the encounter
	let time;
	if(r.relativeTo) {
		// If this time is relative to another time
		const sub = r.relativeTo;
		sub.relationToCurrent = r.relationToCurrent;
		sub.intervalEdge = r.intervalEdge;

		const resolvedTime = map(sub, e, options);
		if(! resolvedTime) return null;

		time = resolvedTime.toDate();
	} else {
		time = options.now || currentTime(e.options);
	}

	// The actual result
	const result = new MutableDateValue();
	result.period = Period.Day;

	// First resolve the year
	if(typeof r.relativeYears !== 'undefined') {
		// Relative year - add the years and keep the current month and day
		result.period = Period.Year;
		time = addYears(time, r.relativeYears);
	} else if(typeof r.year !== 'undefined') {
		// Exact year - set the month and day to the start of year
		result.period = Period.Year;
		time = startOfYear(setYear(time, r.year));
	}

	// Resolve quarter if set
	if(typeof r.relativeQuarters !== 'undefined') {
		// Relative quarter - add the number of quarters, but try to keep day within quarter
		result.period = Period.Quarter;
		time = addQuarters(time, r.relativeQuarters);
	} else if(typeof r.quarter !== 'undefined') {
		// Exact quarter - set it and reset to start of quarter
		result.period = Period.Quarter;

		time = adjust(r, e.options, time, QUARTER);
		time = startOfQuarter(time);
	}

	// Resolve week if set
	if(typeof r.relativeWeeks !== 'undefined') {
		// Relative week - add the week, keep the week day
		result.period = Period.Week;
		time = addWeeks(time, r.relativeWeeks);
	} else if(typeof r.week !== 'undefined') {
		// Exact week - set it and reset to start of week
		result.period = Period.Week;

		time = adjust(r, e.options, time, WEEK);
		time = startOfWeek(time, e.options);
	}

	// Resolve the month
	if(typeof r.relativeMonths !== 'undefined') {
		// Relative month - add the months and keep the day
		result.period = Period.Month;
		time = addMonths(time, r.relativeMonths);
	} else if(typeof r.month !== 'undefined') {
		// Exact month - set the day to the start of the month
		result.period = Period.Month;

		time = adjust(r, e.options, time, MONTH);
		time = startOfMonth(time);
	}

	// Resolve the day
	if(typeof r.relativeDays !== 'undefined') {
		// Relative day
		result.period = Period.Day;
		time = addDays(time, r.relativeDays);
	} else if(typeof r.day !== 'undefined') {
		// If there is an explicit day set it
		result.period = Period.Day;

		time = adjust(r, e.options, time, DAY);
	}

	if(typeof r.dayOfWeek !== 'undefined') {
		result.period = Period.Day;

		const currentDayOfWeek = getDay(time);
		if(currentDayOfWeek >= r.dayOfWeek) {
			time = addWeeks(time, 1);
		}
		time = setDay(time, r.dayOfWeek);

		if(typeof r.dayOfWeekOrdinal !== 'undefined') {
			for(let i=1; i<r.dayOfWeekOrdinal; i++) {
				time = addWeeks(time, 1);
			}
		}
	}

	if(r.intervalEdge === IntervalEdge.End) {
		// If the end of the period has been requested
		time = toEnd(time, result.period, e.options);
	} else if(r.intervalEdge === IntervalEdge.Start) {
		// If the start of the period has been requested
		time = toStart(time, result.period, e.options);
	}

	if(r.intervalAdjustment) {
		// If there is an adjustment to move the interval forward or back
		time = addDays(time, r.intervalAdjustment);
	}

	// Move the time into the result
	result.year = time.getFullYear();
	result.month = time.getMonth();
	result.day = time.getDate();

	return result;
}
