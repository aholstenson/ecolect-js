import {
	addHours,
	addMinutes,
	addSeconds,

	setHours,
	setMinutes,
	setSeconds,

	startOfHour,
	startOfMinute
} from 'date-fns';
import { LocalTime } from 'datetime-types';

import { currentTime } from './currentTime.js';
import { DateTimeData } from './DateTimeData.js';
import { DateTimeOptions } from './DateTimeOptions.js';
import { Meridiem } from './Meridiem.js';
import { Period } from './Period.js';
import { TimeRelationship } from './TimeRelationship.js';

/**
 * Create a time in a 12-hour clock, which will guess the AM or PM.
 */
export function time12h(hour: number, minute?: number, second?: number): DateTimeData | null {
	if(hour < 0 || hour > 24) return null;
	if(typeof minute !== 'undefined' && (minute < 0 || minute > 60)) return null;
	if(typeof second !== 'undefined' && (second < 0 || second > 60)) return null;

	return {
		hour: hour,
		minute: minute,
		second: second,
		meridiem: hour === 0 || hour > 12 ? Meridiem.Fixed : Meridiem.Auto
	};
}

/**
 * Create a time in 24-hour clock, which will not guess AM or PM.
 */
export function time24h(hour: number, minute?: number, second?: number): DateTimeData | null {
	if(hour < 0 || hour > 24) return null;
	if(typeof minute !== 'undefined' && (minute < 0 || minute > 60)) return null;
	if(typeof second !== 'undefined' && (second < 0 || second > 60)) return null;

	return {
		hour: hour,
		minute: minute,
		second: second,
		meridiem: Meridiem.Fixed
	};
}

/**
 * Mark a time as read from a plain number, such as `12` or `2018`. Such a
 * number is only a time when nothing else in the expression claims it.
 *
 * @param time -
 *   the time to mark, or `null` if the number was not a valid time
 * @returns
 *   the marked time, or `null`
 */
export function plainNumberTime(time: DateTimeData | null): DateTimeData | null {
	if(! time) return null;

	return { ...time, fromPlainNumber: true };
}

/**
 * Get if a time was read from a plain number and nothing later in the
 * expression marked it as a time.
 *
 * @param time -
 *   the time to check
 * @returns
 *   `true` if the time is only a time because a number can be one
 */
export function isPlainNumberTime(time: DateTimeData): boolean {
	return time.fromPlainNumber === true
		&& time.meridiem !== Meridiem.Am
		&& time.meridiem !== Meridiem.Pm;
}

/**
 * Drop the marks that only help while an expression is read, so that the
 * time can be reported as a result.
 *
 * @param time -
 *   the time to clean up
 * @returns
 *   the time without parse marks
 */
export function asTime(time: DateTimeData): DateTimeData {
	if(! time.fromPlainNumber) return time;

	const result = { ...time };
	delete result.fromPlainNumber;
	return result;
}

/**
 * Switch the given time to PM. The given data is left as it is, as it may be
 * shared with other parses of the same tokens.
 */
export function toPM(time: DateTimeData): DateTimeData {
	return { ...time, meridiem: Meridiem.Pm };
}

/**
 * Switch the given time to AM. The given data is left as it is, as it may be
 * shared with other parses of the same tokens.
 */
export function toAM(time: DateTimeData): DateTimeData {
	return { ...time, meridiem: Meridiem.Am };
}

export function mapTime(r: DateTimeData, options: DateTimeOptions & { reference?: Date }= {}) {
	let time = currentTime(options);
	const now = options.reference ?? options.now ?? time;

	let period = Period.Hour;

	if(typeof r.relativeHours !== 'undefined') {
		period = Period.Hour;

		time = addHours(time, r.relativeHours);
	} else if(typeof r.hour !== 'undefined') {
		period = Period.Hour;

		// Always force fixed meridiem when hours are > 12
		const meridiem = r.hour > 12 ? Meridiem.Fixed : r.meridiem;

		// Hours are a bit special and require some special meridiem handling
		let hourToSet;
		if(meridiem === Meridiem.Auto) {
			// Automatic meridiem
			const hour12 = now.getHours() % 12 || 12;
			if(r.hour < hour12 || (now.getHours() > 12 && r.hour ===  12)) {
				// Requested time is before the current hour - adjust forward in time
				hourToSet = r.hour + 12;
			} else {
				hourToSet = now.getHours() <= 12 ? r.hour : (r.hour + 12);
			}
		} else if(meridiem === Meridiem.Am) {
			// AM meridiem - time set is hours directly
			hourToSet = r.hour === 12 ? 0 : r.hour;
		} else if(meridiem === Meridiem.Pm) {
			// PM meridiem - time to set is hours + 12
			hourToSet = r.hour === 12 ? 12 : (r.hour + 12);
		} else {
			// Assume fixed meridiem
			hourToSet = r.hour;
		}

		// TODO: Move time ahead by a day?
		time = setHours(time, hourToSet);

		time = startOfHour(time);
	}

	if(typeof r.relativeMinutes !== 'undefined') {
		period = Period.Minute;

		time = addMinutes(time, r.relativeMinutes);
	} else if(typeof r.minute !== 'undefined') {
		period = Period.Minute;

		if(r.minute < time.getMinutes() && r.relationToCurrent !== TimeRelationship.Past) {
			// The given minute is before the current minute - assume next hour
			time = setMinutes(addHours(time, 1), r.minute);
		} else {
			// Treat as same hour
			time = setMinutes(time, r.minute);
		}

		time = startOfMinute(time);
	}

	if(typeof r.relativeSeconds !== 'undefined') {
		period = Period.Second;

		time = addSeconds(time, r.relativeSeconds);
	} else if(typeof r.second !== 'undefined') {
		period = Period.Second;

		if(r.second < time.getSeconds() && r.relationToCurrent !== TimeRelationship.Past) {
			// The given second is before the current second - assume next minute
			time = setSeconds(addMinutes(time, 1), r.second);
		} else {
			// Treat as same minute
			time = setSeconds(time, r.second);
		}
	}

	//precision = r.precision || precision || Precision.Normal;
	return LocalTime.fromDate(time);
}
