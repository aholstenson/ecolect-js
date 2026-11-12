import { DayOfWeek } from 'datetime-types';

/**
 * The name of a day of the week, as used in settings that are plain data.
 */
export type DayName = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * A day of the week in a setting. It is a `DayOfWeek`, where Monday is 1 and
 * Sunday is 7, or the name of the day such as `monday`.
 */
export type DaySetting = DayOfWeek | DayName;

const DAY_NAMES: readonly DayName[] = [
	'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

/**
 * Read a day of the week from a setting. The names can be short, such as
 * `mon`, and in any case. The number 0 is read as Sunday, as `Date.getDay()`
 * counts it.
 *
 * @param value -
 *   the day as a number from 1 for Monday to 7 for Sunday, or as a name
 * @returns
 *   the day, or `undefined` if the value is not a day of the week
 */
export function toDayOfWeek(value: unknown): DayOfWeek | undefined {
	if(typeof value === 'number') {
		if(value === 0) return DayOfWeek.SUNDAY;
		return Number.isInteger(value) && value >= 1 && value <= 7 ? value as DayOfWeek : undefined;
	}

	if(typeof value !== 'string') return undefined;

	const name = value.trim().toLowerCase();
	if(name.length < 3) return undefined;

	const index = DAY_NAMES.findIndex(day => day === name || day.substring(0, 3) === name);
	return index < 0 ? undefined : (index + 1) as DayOfWeek;
}

/**
 * Get the name of a day of the week.
 *
 * @param day -
 *   the day
 * @returns
 *   the name, such as `monday`
 */
export function toDayName(day: DayOfWeek): DayName {
	return DAY_NAMES[(day + 6) % 7];
}

/**
 * The days of the weekend when no setting names them.
 */
export const DEFAULT_WEEKEND: readonly DayOfWeek[] = [ DayOfWeek.SATURDAY, DayOfWeek.SUNDAY ];

/**
 * Read the days of the weekend from a setting.
 *
 * @param value -
 *   a list of days, as numbers or names
 * @returns
 *   the days without duplicates, or `undefined` if the value is not a list
 *   of one to six days of the week
 */
export function toWeekend(value: unknown): DayOfWeek[] | undefined {
	if(! Array.isArray(value)) return undefined;

	const days = new Set<DayOfWeek>();
	for(const item of value) {
		const day = toDayOfWeek(item);
		if(typeof day === 'undefined') return undefined;

		days.add(day);
	}

	return days.size >= 1 && days.size <= 6 ? [ ...days ].sort((a, b) => a - b) : undefined;
}

/**
 * Describe the weekend as the day it starts on and the number of days in
 * it. The weekend starts on the day of it that has a work day before it.
 *
 * @param weekend -
 *   the days of the weekend, Saturday and Sunday if not given
 * @returns
 *   the first day of the weekend and its length in days
 */
export function weekendSpan(weekend: readonly DaySetting[] = DEFAULT_WEEKEND): { start: DayOfWeek; days: number } {
	const days = new Set((toWeekend(weekend) ?? DEFAULT_WEEKEND) as readonly number[]);

	let start = DayOfWeek.SATURDAY as number;
	for(const day of days) {
		const previous = day === 1 ? 7 : day - 1;
		if(! days.has(previous)) {
			start = day;
			break;
		}
	}

	// Count the days that follow the start without a work day between them
	let length = 0;
	for(let day = start; days.has(day) && length < 7; day = day === 7 ? 1 : day + 1) {
		length++;
	}

	return { start: start as DayOfWeek, days: length };
}
