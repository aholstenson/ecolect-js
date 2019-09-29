import { TimeRelationship } from './TimeRelationship';
import { IntervalEdge } from './IntervalEdge';
import { Weekday } from './Weekday';
import { Meridiem } from './Meridiem';
import { Precision } from './Precision';

/**
 * Data that is extracted during a parse operation. This is used to map into
 * a date - which is represented by DateValue.
 */
export interface DateTimeData {
	precision?: Precision;

	year?: number;
	quarter?: number;
	week?: number;
	month?: number;
	day?: number;

	/**
	 * Day of week requested.
	 */
	dayOfWeek?: Weekday;

	/**
	 * Ordinal describing what day of week in the current period is being
	 * described.
	 */
	dayOfWeekOrdinal?: number;

	meridiem?: Meridiem;

	hour?: number;
	minute?: number;
	second?: number;
	millisecond?: number;

	relativeTo?: DateTimeData;
	relativeYears?: number;
	relativeQuarters?: number;
	relativeWeeks?: number;
	relativeMonths?: number;
	relativeDays?: number;
	relativeHours?: number;
	relativeMinutes?: number;
	relativeSeconds?: number;
	relativeMilliseconds?: number;

	relationToCurrent?: TimeRelationship;
	intervalEdge?: IntervalEdge;

	intervalAdjustment?: number;
}
