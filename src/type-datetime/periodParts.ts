import { addDays, addMonths, differenceInCalendarDays, getDay, startOfDay } from 'date-fns';

import type { DateTimeData } from './DateTimeData.js';
import type { DateTimeOptions } from './DateTimeOptions.js';
import { toEnd, toStart } from './intervals.js';
import { Period } from './Period.js';
import { weekendSpan } from './weekdays.js';

/**
 * A part of a period, such as the `early` of `early january`. A period has
 * three parts that do not overlap.
 */
export enum PeriodPart {
	Early = 'early',

	Mid = 'mid',

	Late = 'late'
}

/**
 * The days that the parts of a week are taken from.
 */
export enum WeekParts {
	/**
	 * The parts are in the work days, which are the days that are not in
	 * the weekend. With a weekend of Saturday and Sunday the early part is
	 * Monday and Tuesday, the middle part is Wednesday and the late part is
	 * Thursday and Friday.
	 */
	WorkWeek = 'work-week',

	/**
	 * The parts are in all seven days. The early part is the first two days
	 * of the week, the middle part is the next three days and the late part
	 * is the last two days.
	 */
	FullWeek = 'full-week'
}

/**
 * Get if a date is a period that has parts, such as a year, a quarter, a
 * month or a week, and no part of it is picked yet.
 *
 * @param v -
 *   the date to check
 * @returns
 *   `true` if `early`, `mid` and `late` can pick a part of the date
 */
export function isPeriodWithParts(v: DateTimeData): boolean {
	if(typeof v.day !== 'undefined'
		|| typeof v.dayOfWeek !== 'undefined'
		|| typeof v.weekend !== 'undefined'
		|| typeof v.relativeDays !== 'undefined'
		|| typeof v.relativeTo !== 'undefined'
		|| typeof v.intervalEdge !== 'undefined'
		|| typeof v.periodPart !== 'undefined') {
		return false;
	}

	return typeof v.year !== 'undefined'
		|| typeof v.quarter !== 'undefined'
		|| typeof v.month !== 'undefined'
		|| typeof v.week !== 'undefined';
}

/**
 * Pick a part of a period, such as the middle of a month.
 *
 * @param v -
 *   the period
 * @param part -
 *   the part to pick
 * @returns
 *   the part of the period
 */
export function withPeriodPart(v: DateTimeData, part: PeriodPart): DateTimeData {
	return { ...v, periodPart: part };
}

/**
 * Get the first and the last day of a part of a period.
 *
 * A year has parts of four months and a quarter has parts of one month. A
 * month is split by days. The early and the late part have a third of the
 * days, rounded down, and the middle part has the rest. So a month of 31
 * days is the 1st to the 10th, the 11th to the 21st and the 22nd to the
 * 31st.
 *
 * A week is split as the `weekParts` option says. Without the option the
 * parts are in the work days, which the `weekend` option decides.
 *
 * @param time -
 *   a time in the period
 * @param period -
 *   the length of the period
 * @param part -
 *   the part to get
 * @param options -
 *   options with the week settings
 * @returns
 *   the first and the last day, or `null` if the period has no parts
 */
export function partOfPeriod(
	time: Date,
	period: Period,
	part: PeriodPart,
	options: DateTimeOptions
): { start: Date; end: Date } | null {
	const start = toStart(time, period, options);
	const end = startOfDay(toEnd(time, period, options));

	let midStart: Date;
	let lateStart: Date;
	if(period === Period.Year || period === Period.Quarter) {
		const months = period === Period.Year ? 4 : 1;
		midStart = addMonths(start, months);
		lateStart = addMonths(start, months * 2);
	} else if(period === Period.Week && options.weekParts !== WeekParts.FullWeek) {
		/*
		 * The work days are the days that are not in the weekend, and they
		 * start on the day after it. The early and the late part have two
		 * days each, and the middle part has the days between them.
		 */
		const span = weekendSpan(options.weekend);
		const workDays = 7 - span.days;
		const firstWorkDay = (span.start + span.days - 1) % 7 + 1;
		const first = addDays(start, (firstWorkDay - (getDay(start) || 7) + 7) % 7);
		if(workDays < 5) {
			// Too few work days for parts of two days
			const third = Math.max(1, Math.floor(workDays / 3));
			midStart = addDays(first, Math.min(third, workDays - 1));
			lateStart = addDays(first, Math.max(workDays - third, 0));
		} else {
			midStart = addDays(first, 2);
			lateStart = addDays(first, workDays - 2);
		}

		switch(part) {
			case PeriodPart.Early:
				return { start: first, end: addDays(midStart, -1) };
			case PeriodPart.Mid:
				return { start: midStart, end: addDays(lateStart, -1) };
			default:
				return { start: lateStart, end: addDays(first, workDays - 1) };
		}
	} else if(period === Period.Month || period === Period.Week) {
		const days = differenceInCalendarDays(end, start) + 1;
		const third = Math.floor(days / 3);
		midStart = addDays(start, third);
		lateStart = addDays(start, days - third);
	} else {
		return null;
	}

	switch(part) {
		case PeriodPart.Early:
			return { start, end: addDays(midStart, -1) };
		case PeriodPart.Mid:
			return { start: midStart, end: addDays(lateStart, -1) };
		default:
			return { start: lateStart, end };
	}
}
