import { DateInterval } from 'datetime-types';

import { clone } from './clone';
import { mapDate, today } from './dates';
import { DateTimeData } from './DateTimeData';
import { DateTimeOptions } from './DateTimeOptions';
import { IntervalData } from './IntervalData';
import { IntervalEdge } from './IntervalEdge';
import { adjusted } from './matching';
import { TimeRelationship } from './TimeRelationship';

/**
 * Create an interval that matches dates in the past.
 */
export function inThePast(r: any, options: DateTimeOptions) {
	return {
		start: null,
		end: adjusted(today(null, options), -1)
	};
}

/**
 * Create an interval that matches dates in the future.
 */
export function inTheFuture(r: any, options: DateTimeOptions) {
	return {
		start: adjusted(today(null, options), 1),
		end: null
	};
}

/**
 * Create an open ended interval that matches any time.
 */
export function anyTime() {
	return {
		start: null,
		end: null
	};
}

export function hasSingle(v: IntervalData) {
	return v && typeof v.start !== 'undefined' && v.start === v.end;
}

function applyRelationAndEdge(r: DateTimeData, edge: IntervalEdge) {
	if(! r.intervalEdge) r.intervalEdge = edge;
	if(! r.relationToCurrent) r.relationToCurrent = TimeRelationship.CurrentPeriod;
	return r;
}

export function mapDateInterval(r: IntervalData, options: DateTimeOptions): DateInterval {
	let start = null;
	let end = null;

	if(r.end) {
		if(r.start) {
			/*
			* To support cases such where the end has a year set but not the start
			* we copy some selected fields.
			*/
			if(typeof r.start.year === 'undefined') r.start.year = r.end.year;
			if(typeof r.start.month === 'undefined') r.start.month = r.end.month;

			start = mapDate(applyRelationAndEdge(clone(r.start), IntervalEdge.Start), options);
			if(! start) throw new Error();

			end = mapDate(applyRelationAndEdge(r.end, IntervalEdge.End), { ...options, now: start.toDateAtMidnight() });
		} else {
			end = mapDate(applyRelationAndEdge(r.end, IntervalEdge.End), options);
		}
	} else {
		// This interval has no end
		if(r.start) {
			// There is a start available - map it
			start = mapDate(applyRelationAndEdge(r.start, IntervalEdge.Start), options);
		} else {
			// No start and no end, represents all time
		}
	}

	return DateInterval.between(start, end);
}
