import { DateInterval } from 'datetime-types';

import { mapDate, today } from './dates.js';
import { DateTimeData } from './DateTimeData.js';
import { DateTimeOptions } from './DateTimeOptions.js';
import { IntervalData } from './IntervalData.js';
import { IntervalEdge } from './IntervalEdge.js';
import { adjusted } from './matching.js';
import { TimeRelationship } from './TimeRelationship.js';

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

/**
 * Copy the given data and give it the relation and interval edge that an edge
 * of an interval needs. A copy is made so that mapping an interval does not
 * change the data it was given, which matters as the same data may describe
 * both the start and the end of an interval.
 *
 * @param r -
 *   the data describing one edge of the interval
 * @param edge -
 *   the edge the data describes
 * @returns
 *   copy of the data with the relation and edge applied
 */
function applyRelationAndEdge(r: DateTimeData, edge: IntervalEdge): DateTimeData {
	return {
		...r,
		intervalEdge: r.intervalEdge ?? edge,
		relationToCurrent: r.relationToCurrent ?? TimeRelationship.CurrentPeriod
	};
}

export function mapDateInterval(r: IntervalData, options: DateTimeOptions): DateInterval {
	let start = null;
	let end = null;

	if(r.end) {
		if(r.start) {
			/*
			 * To support cases such where the end has a year set but not the
			 * start we copy some selected fields.
			 */
			const startData: DateTimeData = {
				...r.start,
				year: r.start.year ?? r.end.year,
				month: r.start.month ?? r.end.month
			};

			start = mapDate(applyRelationAndEdge(startData, IntervalEdge.Start), options);
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
