import { DateTimeData } from './date-time-data';

export interface IntervalData {
	start: DateTimeData | null;

	end: DateTimeData | null;
}

/**
 * Determine if a certain value represents IntervalData.
 *
 * @param a
 */
export function isIntervalData(a: any): a is IntervalData {
	return typeof a === 'object' && typeof a.start !== 'undefined';
}
