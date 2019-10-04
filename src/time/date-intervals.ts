import { mapDate, today } from './dates';
import { cloneObject } from '../utils/cloning';
import { adjusted } from './matching';
import { DateTimeEncounter } from './DateTimeEncounter';
import { IntervalData } from './IntervalData';
import { DateTimeData } from './DateTimeData';
import { IntervalEdge } from './IntervalEdge';
import { TimeRelationship } from './TimeRelationship';
import { DateInterval } from 'datetime-types';

/**
 * Create an interval that matches dates in the past.
 */
export function inThePast(r: any, encounter: DateTimeEncounter) {
	return {
		start: null,
		end: adjusted(today(null, encounter), -1)
	};
}

/**
 * Create an interval that matches dates in the future.
 */
export function inTheFuture(r: any, encounter: DateTimeEncounter) {
	return {
		start: adjusted(today(null, encounter), 1),
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

export function mapDateInterval(r: IntervalData, e: DateTimeEncounter): DateInterval {
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

			start = mapDate(applyRelationAndEdge(cloneObject(r.start), IntervalEdge.Start), e);
			if(! start) throw new Error();

			end = mapDate(applyRelationAndEdge(r.end, IntervalEdge.End), e, { now: start.toDateAtMidnight() });
		} else {
			end = mapDate(applyRelationAndEdge(r.end, IntervalEdge.End), e);
		}
	} else {
		// This interval has no end
		if(r.start) {
			// There is a start available - map it
			start = mapDate(applyRelationAndEdge(r.start, IntervalEdge.Start), e);
		} else {
			// No start and no end, represents all time
		}
	}

	return DateInterval.between(start, end);
}
