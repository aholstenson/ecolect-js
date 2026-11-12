import type { DateTimeData } from './DateTimeData.js';
import type { DateTimeOptions } from './DateTimeOptions.js';
import { Meridiem } from './Meridiem.js';
import { time24h, toAM, toPM } from './times.js';

/**
 * The time of a part of the day on a 24-hour clock. It is a full hour as a
 * number, such as `9`, or a time as text, such as `11:30`.
 */
export type DayPartTime = number | string;

/**
 * Read the time of a part of the day.
 *
 * @param value -
 *   a full hour as a number, or a time such as `11:30`
 * @returns
 *   the hour and the minute, or `null` if the value is not a time
 */
export function parseDayPartTime(value: unknown): { hour: number; minute: number } | null {
	if(typeof value === 'number') {
		return Number.isInteger(value) && value >= 0 && value <= 23 ? { hour: value, minute: 0 } : null;
	}

	if(typeof value !== 'string') return null;

	const match = /^([0-9]{1,2})(?::([0-9]{2}))?$/.exec(value.trim());
	if(! match) return null;

	const hour = parseInt(match[1], 10);
	const minute = parseInt(match[2] ?? '0', 10);
	return hour <= 23 && minute <= 59 ? { hour, minute } : null;
}

/**
 * The time of each named part of the day, on a 24-hour clock.
 */
export interface DayPartHours {
	/**
	 * The hour of `morning`. Defaults to 9.
	 */
	morning: DayPartTime;

	/**
	 * The hour of `lunch`. Defaults to 12.
	 */
	lunch: DayPartTime;

	/**
	 * The hour of `afternoon`. Defaults to 15.
	 */
	afternoon: DayPartTime;

	/**
	 * The hour of `evening` and `tonight`. Defaults to 19.
	 */
	evening: DayPartTime;

	/**
	 * The hour of `night`. Defaults to 22.
	 */
	night: DayPartTime;

	/**
	 * The hour the work day starts, as in `start of day`. Defaults to 9.
	 */
	startOfDay: DayPartTime;

	/**
	 * The hour the work day ends, as in `end of day`. Defaults to 17.
	 */
	endOfDay: DayPartTime;
}

/**
 * A named part of the day.
 */
export type DayPart = keyof DayPartHours;

/**
 * The hours used for the parts of the day that the `dayParts` option does
 * not set.
 */
export const DEFAULT_DAY_PART_HOURS: Readonly<DayPartHours> = {
	morning: 9,
	lunch: 12,
	afternoon: 15,
	evening: 19,
	night: 22,
	startOfDay: 9,
	endOfDay: 17
};

/**
 * Get the time of a named part of the day, such as `morning` or the end of
 * the work day. The hour comes from the `dayParts` option, or from the
 * defaults when the option does not set the part.
 *
 * @param part -
 *   the part of the day
 * @param options -
 *   the options of the match
 * @param offsetHours -
 *   hours to add to the hour of the part, such as 1 for `after lunch`
 * @returns
 *   the time, or `null` if the hour is not on a clock
 */
export function dayPart(part: DayPart, options: DateTimeOptions = {}, offsetHours = 0): DateTimeData | null {
	const time = parseDayPartTime(options.dayParts?.[part] ?? DEFAULT_DAY_PART_HOURS[part]);
	if(! time) return null;

	// A full hour has no minute, so that `half past lunch` reads as 12:30
	return time24h(time.hour + offsetHours, time.minute === 0 ? undefined : time.minute);
}

/**
 * Get the time of a named part of the day on a day counted from the current
 * day, such as `this morning` for 0 days or `last night` for -1 days. The
 * time stays on that day, also when it has passed.
 *
 * @param part -
 *   the part of the day
 * @param days -
 *   the days from the current day
 * @param options -
 *   the options of the match
 * @returns
 *   the time on the day, or `null` if the hour is not on a clock
 */
export function dayPartOnDay(part: DayPart, days: number, options: DateTimeOptions = {}): DateTimeData | null {
	const time = dayPart(part, options);
	if(! time) return null;

	return { ...time, relativeDays: days };
}

/**
 * Get if a time is an hour on a 12-hour clock with no AM or PM, such as the
 * `8` of `tonight at 8`. A part of the day can give such an hour its half of
 * the day.
 *
 * @param time -
 *   the time to check
 * @returns
 *   `true` if the half of the day of the hour is open
 */
export function hasOpenHour(time: DateTimeData): boolean {
	return typeof time.hour !== 'undefined' && time.meridiem === Meridiem.Auto;
}

/**
 * Switch an hour to the half of the day that a part of the day is in, such
 * as the evening for `tonight at 8`. An hour in the morning is AM, an hour
 * at night is read as by `toNight` and other hours are PM.
 *
 * @param time -
 *   the time to switch
 * @param part -
 *   the part of the day
 * @returns
 *   the time in the part of the day
 */
export function inDayPart(time: DateTimeData, part: DayPart): DateTimeData {
	switch(part) {
		case 'morning':
		case 'startOfDay':
			return toAM(time);
		case 'night':
			return toNight(time);
		default:
			return toPM(time);
	}
}

/**
 * Switch an hour to the half of the day that the night is in, such as
 * `11 at night` and `2 at night`. The hours 12 and 1 to 4 are after
 * midnight, other hours are before it.
 *
 * @param time -
 *   the time to switch
 * @returns
 *   the time at night
 */
export function toNight(time: DateTimeData): DateTimeData {
	const hour = time.hour as number;
	return hour === 12 || hour <= 4 ? toAM(time) : toPM(time);
}
