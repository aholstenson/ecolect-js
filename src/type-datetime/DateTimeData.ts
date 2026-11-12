import type { DayOfWeek } from 'datetime-types';

import type { IntervalEdge } from './IntervalEdge.js';
import type { Meridiem } from './Meridiem.js';
import type { PeriodPart } from './periodParts.js';
import type { Precision } from './Precision.js';
import type { TimeRelationship } from './TimeRelationship.js';

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
	 * The week within the month, counted from 1 for the calendar week with
	 * the first day of the month in it. A negative number counts from the
	 * end, so -1 is the week with the last day of the month in it.
	 */
	weekOfMonth?: number;

	/**
	 * A weekend, counted in weeks from the current weekend. On a Saturday
	 * or a Sunday the current weekend is the one those days are in, on other
	 * days it is the next one. So 0 is this weekend, 1 is the weekend after
	 * it and -1 is the weekend before it.
	 */
	weekend?: number;

	/**
	 * The part of the period that is asked for, such as the middle of a
	 * month for `mid january`.
	 */
	periodPart?: PeriodPart;

	/**
	 * Day of week requested.
	 */
	dayOfWeek?: DayOfWeek;

	/**
	 * Ordinal describing what day of week in the current period is being
	 * described.
	 */
	dayOfWeekOrdinal?: number;

	meridiem?: Meridiem;

	/**
	 * If the time was read from a plain number, such as `12` or `2018`, with
	 * nothing in the text to mark it as a time. Such a number is only a time
	 * when nothing else in the expression claims it, so this mark is dropped
	 * as soon as the value is reported as a result.
	 */
	fromPlainNumber?: boolean;

	/**
	 * If the date was read with a word before it, such as `on` in
	 * `on friday`. Only one such word is read, so `on on friday` is not a
	 * date. Without this the words could repeat, and a long run of them
	 * would be slow to read.
	 */
	qualified?: boolean;

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
